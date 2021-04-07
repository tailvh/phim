SELECT TABLE_NAME AS `Table`, ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024) AS `Size (MB)` FROM information_schema.TABLES WHERE TABLE_SCHEMA = "cms_betv" ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
mysqldump -u CmsBetv --tab ./cms_betv --fields-terminated-by=, -h 40.40.40.167 -P 3306 -p cms_betv episodes
