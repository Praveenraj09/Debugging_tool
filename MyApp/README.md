### ABOUT THE APPLICATION

This application is a developer-friendly debugging tool built with ReactJS, offering a seamless and efficient debugging experience for developers. With a focus on usability and performance, it provides a range of features to facilitate effective debugging of ReactJS applications.

#### Functionalities:

- **Login:**  Login functionality added.

- **Customizable Dashboard::** : The application offers a customizable dashboard that allows developers to monitor and analyze various aspects of their application, such as schema, table info, and frequent request counts.

- **CData Filters:** Developers can apply various filters to analyze data in charts, including the ability to select and zoom in on specific data sets, display data in table view, and check data between timeframes. Filters can be added or deleted irrespective of data types, with an automatic run count feature that displays the total records when filters are applied.

- **Table Preview:** The application allows developers to preview selected tables with a customizable number of records, facilitating data analysis.

- **Charts:** Developers can analyze total unique columns and counts of any table through interactive charts, providing valuable insights into the application's data.

- **MapView:** The application includes a MapView feature that allows developers to locate any longitude and latitude on a map, aiding in geographical data visualization.

Overall, this application aims to provide developers with a comprehensive set of tools for debugging and analyzing ReactJS applications, helping them identify and resolve issues more efficiently.

---------------------------------------------------------------------------------------------------------

### RUNNING BACKEND PROCEDURE

**Change to the respective directory:**  
extract the project as maven project
run: mvn install
Start the MainApplication

**Editing Application.properties in src/main/resources:**  
spring.datasource.url=jdbc:ocient://host:port/dbname
spring.datasource.username=username
spring.datasource.password=password
spring.datasource.driver-class-name=com.ocient.jdbc.JDBCDriver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.Oracle10gDialect
spring.jpa.open-in-view=false
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration
spring.main.allow-circular-references=true
server.port = 5000
ocient.db.dbname=dbname
ocient.db.schema=schemaname
ocient.db.view_table= tablename
ocient.db.time_column=timecolumn
ocient.db.row_count=500
ocient.db.dashboardTableQuery=select query with two columns one can be any count

**Use the report field to declare the name of the report ending with _report. sample values are provided**
report=Auction_report,Frequency_report
**Use the same ReportName with _column, _tablename, _timecolumn fields**

**Use the same ReportName with _column: values must be comma seperated without any quotes. sample values are provided**
Auction_report_column=created,auctionid,auctionresult
**Use the same ReportName with _tablename: value must be the table name of respective report needed**
Auction_report_tablename=auction_details
**Use the same ReportName with _timecolumn: value must be the time column of respective report needed**
Auction_report_timecolumn=created




---------------------------------------------------------------------------------------------------------
### RUNNING FRONTEND PROCEDURE
Running the Application:

## Backend:
Mvn install
edit the app.properties
run as maven application.

## Frontend:
Change to the Frontend directory. `cd Forntend`
Install requirements: `npm install --force`
Start the application: `npm start`
Open in your browser: `http://localhost:3000`

---------------------------------------------------------------------------------------------------------
### TECHNICAL DETAILS

**Backend**: Springboot, Jdbc
**Frontend**: ReactJS, Material UI, HighCharts, Leaflet Map

- **ReactJS:** Employed for the frontend, ReactJS is known for its component-based architecture and efficient rendering.
- **Material UI:** A React component library, Material UI implements Google's Material Design principles for modern and responsive user interfaces.
- **HighCharts:** HighCharts is a JavaScript charting library used for creating interactive and visually appealing charts and graphs.
- **Leaflet Map:** Leaflet is an open-source JavaScript library for interactive maps, providing functionalities for displaying maps and markers.