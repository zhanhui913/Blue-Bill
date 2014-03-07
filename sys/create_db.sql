DROP TABLE IF EXISTS USERS;

CREATE TABLE USERS(
username varchar(128) NOT NULL,
email varchar(128) NOT NULL,
password varchar(128) NOT NULL,
PRIMARY KEY (username)
);