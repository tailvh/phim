package main

import (
	"fmt"
	"io"
	"log"
	"time"
	"strings"

	"net/http"
	"crypto/tls"

	"github.com/hauke96/sigolo"
)

const configPath = "./zconfig.json"

var config *Config
var cache *Cache
var client *http.Client
var VodBrowserAgentGG = "Mozilla/5.0 (compatible) Feedfetcher-Google; (+http://www.google.com/feedfetcher.html)"

func EnableCorsAll(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "*")
	(*w).Header().Set("Access-Control-Allow-Credentials", "true")
	(*w).WriteHeader(http.StatusOK)
}

func EnableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "*")
	(*w).Header().Set("Access-Control-Allow-Credentials", "true")
}


func main() {
	loadConfig()
	if config.DebugLogging {
		sigolo.LogLevel = sigolo.LOG_DEBUG
	}
	sigolo.Debug("Config loaded")

	prepare()
	sigolo.Debug("Cache initialized")	
	sigolo.Info("Start serving...")

	go func() {
		config := &tls.Config{
			MinVersion:         tls.VersionTLS10,
			ClientSessionCache: tls.NewLRUClientSessionCache(128),
		}
		serverSTL := &http.Server{
			Addr:              ":443",
			ReadTimeout:       15 * time.Second,
			ReadHeaderTimeout: 15 * time.Second,
			WriteTimeout:      15 * time.Second,
			IdleTimeout:       60 * time.Second,
			TLSConfig:         config,
			Handler:           http.HandlerFunc(handleGet),
		}
		log.Fatal(serverSTL.ListenAndServeTLS("./keys/fullchain.pem", "./keys/privkey.pem"))		
	}()
	
	server := &http.Server{
		Addr:         ":" + config.Port,
		WriteTimeout: 30 * time.Second,
		ReadTimeout:  30 * time.Second,
		Handler:      http.HandlerFunc(handleGet),
	}
	err := server.ListenAndServe()
	if err != nil {
		sigolo.Fatal(err.Error())
	}
}

func loadConfig() {
	var err error

	config, err = LoadConfig(configPath)
	if err != nil {
		sigolo.Fatal("Could not read config: '%s'", err.Error())
	}
}


type MyRoundTripper struct {
  r http.RoundTripper
}

func (mrt MyRoundTripper) RoundTrip(r *http.Request) (*http.Response, error) {
  r.Header.Add("User-Agent", VodBrowserAgentGG)
  return mrt.r.RoundTrip(r)
}

func prepare() {
	var err error

	cache, err = CreateCache(config.CacheFolder)

	if err != nil {
		sigolo.Fatal("Could not init cache: '%s'", err.Error())
	}

	client = &http.Client{
		Timeout: time.Second * 30,
		Transport: MyRoundTripper{r: http.DefaultTransport},
	}
}

func ReadUserIP(r *http.Request) string {
  IPAddress := r.Header.Get("X-Real-Ip")
  if IPAddress == "" {
    IPAddress = r.Header.Get("X-Forwarded-For")
  }
  if IPAddress == "" {
    IPAddress = r.RemoteAddr
  }
  return IPAddress
}

func handleGet(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("WHAT THE HELL %v %v IP:%v\n", r.Header.Get("Referer"), r.Header.Get("Origin"), ReadUserIP(r))
	fullUrl := r.URL.Path
	if r.URL.RawQuery != "" {
		fullUrl = r.URL.Path + "?" + r.URL.RawQuery	
	}

	switch r.Method {
	case "OPTIONS":
		EnableCorsAll(&w)
		return
	case "POST":
		sigolo.Debug("Wrote %v \n", "AM HERE")
		EnableCors(&w)		
		if busy, ok := cache.has(fullUrl); !ok {
			defer busy.Unlock()
			if r.Method == "POST" {
				fullUrl := r.URL.Path				
				var reader io.Reader
				reader = r.Body
				err := cache.put(fullUrl, &reader, r.ContentLength)
				if err != nil {
					handleError(err, w)				
				}				
			}	
		}
		return
	case "GET":
		if busy, ok := cache.has(fullUrl); !ok {
			defer busy.Unlock()
			response, err := client.Get(config.Target + fullUrl)
			if err != nil {
				handleError(err, w)
				return
			}

			var reader io.Reader
			reader = response.Body
			err = cache.put(fullUrl, &reader, response.ContentLength)
			if err != nil {
				handleError(err, w)
				return
			}
			defer response.Body.Close()
		}	
		
		content, err := cache.get(fullUrl)
	 	if r.Header.Get("User-Agent") == VodBrowserAgentGG || strings.HasSuffix(fullUrl, ".m3u8") || true {
			if err != nil {
				handleError(err, w)
			} else {
				EnableCors(&w)
				bytesWritten, err := io.Copy(w, *content)
				if err != nil {
					sigolo.Error("Error writing response: %s", err.Error())
					handleError(err, w)
					return
				}
				sigolo.Debug("Wrote %d bytes", bytesWritten)
			}
		} else { /* EnableCors(&w) // http.Redirect(w, r, config.GGProxyLink + fullUrl , 307) */ }
		return
	}
}

func handleError(err error, w http.ResponseWriter) {
	sigolo.Error(err.Error())
	w.WriteHeader(500)
	fmt.Fprintf(w, err.Error())
}
