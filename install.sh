#!/bin/bash
# The Script for importing sql statements

# directories
_create_db_path="./sys/create_db.sql"
_drop_db_path="./sys/drop_tables.sql"
_insert_test_path="./sys/data_for_testing.sql"
_db_name="zhanyapc_blue" 

cwd=$(pwd)

# mysql info
mysql_name=""
mysql_password=""

# pre-defined queries
#_create_db_query="CREATE DATABASE IF NOT EXISTS $_db_name;"
#_path_str="/docs/VeterinaryClinicList_cleaned_col.csv"
#_load_data_str_local="LOAD DATA LOCAL INFILE '"
#_load_data_str="LOAD DATA INFILE '"
#_columns_str="' INTO TABLE CLINIC FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' (name,@ignore,address,city,province,postal_code,latitude,longtitude,email,website,@ignore,phone,@ignore,@ignore) SET clinic_id = uuid();"
#_load_csv_query= $_load_data_str$_abs_path_str$_columns_str

# change this if you need to connect a remote server
_HOST="127.0.0.1"   #localhost

# set permission
chmod -R "700" "$_create_db_path"
chmod -R "700" "$_insert_test_path"
chmod -R "777" "$cwd$_path_str"


echo -e "\n ===================== Petrinery Deployment Toolkit ===================== \n"
login(){
    while [ "$mysql_name" == "" ] ; do 
        echo -n "Enter your mysql username:"
        read mysql_name
        echo -n "Enter your mysql password:"
        read mysql_password
        echo
    done
}

drop_all(){
    # drop all tables
    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" "$_db_name" < "$_drop_db_path" --verbose
}

insert_all(){
    #TODO:
    echo -e "TODO:insert all the tuples into db"
    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" "$_db_name" < "$_insert_test_path" --verbose

}

rebuild_all(){
    # create database
    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" --verbose -e "$_create_db_query"
    
    # create tables through pipe
    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" "$_db_name" < "$_create_db_path" --verbose 

    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" "$_db_name" <<< "$_load_data_str$cwd$_path_str$_columns_str" --verbose 

    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" "$_db_name" < "$_insert_test_path" --verbose
}

marko(){
    # create database
    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" --verbose -e "$_create_db_query"
    
    # create tables through pipe
    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" "$_db_name" < "$_create_db_path" --verbose 

    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" "$_db_name" <<< "$_load_data_str$cwd$_path_str$_columns_str" --verbose 

    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" "$_db_name" < "$_insert_test_path" --verbose
}

tom(){
     # create database
    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" --verbose -e "$_create_db_query"
    
    # create tables through pipe
    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" "$_db_name" < "$_create_db_path" --verbose 

    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" "$_db_name" <<< "$_load_data_str_local$cwd$_path_str$_columns_str" --verbose 

    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" "$_db_name" < "$_insert_test_path" --verbose
}

brad(){
    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" --verbose -e "$_create_db_query"
    
    # create tables through pipe
    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" "$_db_name" < "$_create_db_path" --verbose 

    mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" "$_db_name" <<< "$_load_data_str_local$_win_csv_path$_columns_str" --verbose

	mysql -u "$mysql_name" -p"$mysql_password" -h "$_HOST" "$_db_name" < "$_insert_test_path" --verbose
}

# flags
case $1 in
    "-brad")        login
                    brad;;
    "-marko")       login
                    marko;;
    "-tom")         login
                    tom;;
    "-rebuild_all") login
                    rebuild_all;;
    "-insert_test") login
                    insert_all;;
    "-drop_all")    login
                    drop_all;;
    "-backup_all")  backup_all;;
    *)              echo "Invalid flag argument"
                    exit $?;;
esac
echo -e "\n ======================================================================= \n"
exit $?





