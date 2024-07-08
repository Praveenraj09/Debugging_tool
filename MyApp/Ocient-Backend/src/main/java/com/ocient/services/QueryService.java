package com.ocient.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import com.ocient.config.DatabaseConnection;
import com.ocient.config.ReportConfig;
import com.ocient.jdbc.XGTimestamp;
import com.ocient.pojofunction.ConvertionFunction;
import com.univocity.parsers.conversions.DateConversion;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

@Service
public class QueryService {

	private static final String q_schemas = "select schema_name as schemaname, count(schema_name) as countschema "
			+ "from information_schema.schemata " + "where schema_name != 'sys' and "
			+ "schema_name != 'information_schema' group by schema_name";

	private static final String q_fetchdashboard_table = "select distinct country_name as Country_Name,count(*) as counts from chicago.ip2location  group by country_name order by counts desc";

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	DatabaseConnection connection;

	@Autowired
	private ReportConfig reportConfig;

	@Value("${ocient.db.dbname}")
	private String db;

	@Value("${ocient.db.schema}")
	private String schema;

	@Value("${ocient.db.view_table}")
	private String viewTable;

	@Value("${ocient.db.time_column}")
	private String timeColumn;

	@Value("${ocient.db.row_count}")
	private int rowCount;
	
	@Value("${ocient.db.chart_points}")
	private int chart_points;
	
	@Value("${ocient.db.chart_frequncy}")
	private int chart_frequncy;

	@Value("${ocient.db.dashboardTableQuery}")
	private String dashboardTableQuery;

	@Value("${ocient.db.join_required}")
	private boolean joinRequired;

	@Value("${ocient.db.jointable_count}")
	private int joinTableCount;

	@Value("${ocient.db.jointable1}")
	private String joinTable1;

	@Value("${ocient.db.jointable1_primaryid}")
	private String joinTable1PrimaryId;

	@Value("${ocient.db.viewable_primaryId}")
	private String viewable_primaryId;



	public Map<String, Object> getDashboard() {
		List<Map<String, Object>> schemas = runQuery(q_schemas);

		int schemacount = schemas.size();
		List<Map<String, Object>> table = getTablefromDB();

		Map<String, Object> data = new HashMap<>();
		data.put("schemacount", schemacount);
		data.put("counts", table.size()); // Replace with actual tables count if needed
		data.put("tables", table); // Replace with actual tables data if needed
		data.put("schemas", schemas);
		System.out.println(data.toString());
		return data;
	}

	public List<Map<String, Object>> getTables() {
		String query = "SELECT * FROM information_schema.tables WHERE table_schema = '" + schema + "'";
		List<Map<String, Object>> result = runQuery(query);

		return result;
	}

	public Map<String, Object> getTableData(Map<String, Object> payload) {
		String selectedTable = (String) payload.get("filterTable");
		int selectedLimit = (Integer) payload.get("filterSelect");
		if (selectedLimit == 0)
			selectedLimit = 10;

		List<Map<String, Object>> columns;
		String query = "SELECT column_name FROM information_schema.columns WHERE table_name = '" + selectedTable + "'";
		columns = runQuery(query);

		if (columns.isEmpty()) {
			// Handle case where no columns are found
			System.out.println("No columns found for table: " + selectedTable);
			return null;
		}

		String columnSelect = columns.stream().map(col -> col.get("column_name").toString())
				.reduce((col1, col2) -> col1 + ", " + col2).orElse("*");

		query = "SELECT " + columnSelect + " FROM " + schema + "." + selectedTable + " ORDER BY "
				+ columns.get(0).get("column_name") + " DESC LIMIT " + selectedLimit;
		List<Map<String, Object>> data = runQuery(query);

		Map<String, Object> response = new HashMap<>();
		response.put("result", data);
		response.put("columns", columns);
		response.put("tables", getTables());
		response.put("selected_table", selectedTable);
		System.out.println(response.toString());
		return response;
	}

	public Map<String, Object> fetch_TableInfo() throws SQLException {
		List<Map<String, Object>> resultList = runQuery(q_schemas);

		// Get column names
		String[] columnNames = resultList.isEmpty() ? new String[0] : resultList.get(0).keySet().toArray(new String[0]);

		// Structure the response data as an array of dictionaries
		List<Map<String, Object>> responseData = new ArrayList<>();
		for (Map<String, Object> row : resultList) {
			Map<String, Object> rowData = new HashMap<>();
			for (String col : columnNames) {
				rowData.put(col, row.get(col));
			}
			responseData.add(rowData);
		}

		Map<String, Object> response = new HashMap<>();
		response.put("columnName", columnNames);
		response.put("data", responseData);

		return response;
	}
	public List<Map<String, Object>> getColumns() {
	    StringBuilder queryBuilder = new StringBuilder();

	    if (joinRequired) {
	        // Select all columns from primary table
	        queryBuilder.append("SELECT '").append(joinTable1).append("' || '.' || c1.column_name AS column_name, c1.data_type as data_type ")
	                    .append("FROM information_schema.columns c1 ")
	                    .append("WHERE c1.table_schema = '").append(schema).append("' ")
	                    .append("AND c1.table_name = '").append(joinTable1).append("' ")
	                    .append("UNION ALL ");

	          
	                
	                queryBuilder.append("SELECT '").append(viewTable).append("' || '.' || c2.column_name AS column_name, c2.data_type as data_type  ")
	                            .append("FROM information_schema.columns c2 ")
	                            .append("LEFT JOIN information_schema.columns c1 ")
	                            .append("ON c1.column_name = c2.column_name ")
	                            .append("AND c1.table_name = '").append(joinTable1).append("' ")
	                            .append("AND c1.table_schema = '").append(schema).append("' ")
	                            .append("WHERE c2.table_schema = '").append(schema).append("' ")
	                            .append("AND c2.table_name = '").append(viewTable).append("' ")
	                            .append("AND c1.column_name IS NULL ");
	            
	        
	    } else {
	        // Select all columns from the primary table
	        queryBuilder.append("SELECT c.table_name || '.' || c.column_name AS column_name, c.data_type as data_type  ")
	                    .append("FROM information_schema.columns c ")
	                    .append("WHERE c.table_schema = '").append(schema).append("' ")
	                    .append("AND c.table_name = '").append(viewTable).append("' ");
	    }

	    queryBuilder.append("ORDER BY column_name");
	    String query = queryBuilder.toString();
	    return runQuery(query);
	}


	private String getJoinTable(int index) {
	    switch (index) {
	        case 1:
	            return joinTable1;
	        
	        default:
	            return null;
	    }
	}

	public Map<String, Object> getFilters(Map<String, Object> payload) {
		String timeColumns = (String) payload.getOrDefault("timeColumn", timeColumn);
		String viewTables = (String) payload.getOrDefault("viewTable", viewTable);

		String query = String.format(
				"SELECT DATE_TRUNC('minute', %s) - INTERVAL '1 minute' * (EXTRACT(MINUTE FROM %s)::INT %% %d) AS time_range_start, "
						+ "DATE_TRUNC('minute', %s) - INTERVAL '1 minute' * (EXTRACT(MINUTE FROM %s)::INT %% %d) + INTERVAL '5 minute' AS time_range_end, "
						+ "COUNT(*) AS record_count FROM %s.%s GROUP BY time_range_start, time_range_end ORDER BY time_range_start DESC LIMIT %d",
				timeColumns, timeColumns,chart_frequncy, timeColumns, timeColumns,chart_frequncy, schema, viewTables, chart_points);
		List<Map<String, Object>> data = runQuery(query);

		List<String> xValues = new ArrayList<>();
		List<Long> aValues = new ArrayList<>();
		List<Map<String, Object>> combinedList = new ArrayList<>();
        for (Map<String, Object> row : data) {
            Map<String, Object> combinedMap = new HashMap<>();
            combinedMap.put("time_range_start", ConvertionFunction.convertDate(row.get("time_range_start")));
            combinedMap.put("record_count", (Long) row.get("record_count"));
            combinedList.add(combinedMap);
        }

        // Sort the list of maps based on the time_range_start
        combinedList.sort(Comparator.comparing(o -> (String) o.get("time_range_start")));

        // Extract the sorted values back into separate lists
        for (Map<String, Object> combinedMap : combinedList) {
            xValues.add((String) combinedMap.get("time_range_start"));
            aValues.add((Long) combinedMap.get("record_count"));
        }

		Map<String, Object> response = new HashMap<>();
		response.put("x_values", xValues);
		response.put("a_values", aValues);
		return response;
	}

	public List<Map<String, Object>> getChartData(Map<String, String> payload) {
		String selectedTimeFrame = payload.get("time-frame");
		int timeCondition = selectedTimeFrame.equals("1min") ? 1 : selectedTimeFrame.equals("3min") ? 3 : 5;

		String query = String.format(
				"SELECT DATE_TRUNC('minute', %s) - INTERVAL '1 minute' * (EXTRACT(MINUTE FROM %s)::INT %% %d) AS xaxis, "
						+ "COUNT(DISTINCT request_id) AS axis FROM %s.%s GROUP BY xaxis ORDER BY xaxis DESC limit %d",
				timeColumn, timeColumn, timeCondition, schema, viewTable, rowCount);
		return runQuery(query);
	}

	public Map<String, Object> fetchData(Map<String, Object> payload) {
		String viewTables = (String) payload.getOrDefault("viewTable", viewTable);
		String timeColumns = (String) payload.getOrDefault("timeColumn", timeColumn);
		System.out.println(payload.get("reportName"));
		List<Map<String, Object>> columns = (List<Map<String, Object>>) payload.get("columns");

		// Handle null or default values for minTime and maxTime if needed
		String minTime = (String) payload.get("minTime");
		String maxTime = (String) payload.get("maxTime");

		// Default to current date if maxTime is null
		if (maxTime == null) {
			maxTime = ConvertionFunction.convertDate(new Date());
		}

		// Default to previous day's date if minTime is null
		if (minTime == null) {
			Calendar calendar = Calendar.getInstance();
			calendar.add(Calendar.DAY_OF_MONTH, -1);
			Date previousDate = calendar.getTime();
			minTime = ConvertionFunction.convertDate(previousDate);
		}

		// Get conditions, defaulting to an empty string if null
		String conditions = (String) payload.getOrDefault("conditions", "");

		// If columns are not provided in payload, get default columns
		if (columns == null || columns.isEmpty()) {
			Map<String, Object> timeColumnMap = new HashMap<>();
			timeColumnMap.put("column_name", (viewTables+"."+timeColumns)); // Assuming the key for column name is "name"
			columns = Collections.singletonList(timeColumnMap); // Assuming getColumns() retrieves default columns
		}

		// Construct column names string for SQL query
		String columnNames = columns.stream().map(column -> "" + column.get("column_name") + " as \""+column.get("column_name")+"\" ")
				.collect(Collectors.joining(", "));
		
		System.out.println(columnNames);
		String query = "SELECT "+columnNames+" FROM "+schema+"."+viewTables+" ";
		if(joinRequired) {
			query+=" INNER JOIN "+schema+"."+joinTable1+" ON "+viewTables+"."+viewable_primaryId+" = "+joinTable1+"."+joinTable1PrimaryId+" ";
		}
		query+= " WHERE "+ viewTables+"."+timeColumn+" >= '"+minTime+"' AND "+ viewTables+"."+timeColumn+" <= '"+maxTime+"' ";
		if(joinRequired) {
			query+= " AND "+ joinTable1+"."+timeColumn+" >= '"+minTime+"' AND "+ joinTable1+"."+timeColumn+" <= '"+maxTime+"' ";
		}
		query+=		 (!conditions.isBlank() ? "AND " + conditions : "")+" ORDER BY "+ viewTables+"."+timeColumn+" DESC LIMIT "+rowCount;
		 

		// Log the constructed query for debugging

		// Execute the query and get data
		List<Map<String, Object>> data = runQuery(query);

		// Prepare response map
		Map<String, Object> response = new HashMap<>();
		response.put("datas", data);
		response.put("columns", columns);

		return response;
	}
	
	public List<Map<String, Object>> runCount(Map<String, Object> payload) {
		String conditions = (String) payload.get("conditions");
		String minTime = (String) payload.get("minTime");
		String maxTime = (String) payload.get("maxTime");
		if (maxTime == null)
			maxTime = ConvertionFunction.convertDate(new Date());
		if (minTime == null) {
			Calendar calendar = Calendar.getInstance();
			calendar.add(Calendar.DAY_OF_MONTH, -1);
			Date previousDate = calendar.getTime();
			minTime = ConvertionFunction.convertDate(previousDate);

		}
		System.out.println(conditions + " " + minTime + " " + maxTime);
		String query = "SELECT count(*) AS counts FROM "+schema+"."+viewTable+" ";
		if(joinRequired) {
			query+=" INNER JOIN "+schema+"."+joinTable1+" ON "+viewTable+"."+viewable_primaryId+" = "+joinTable1+"."+joinTable1PrimaryId+" ";
		}
		query+= " WHERE "+ viewTable+"."+timeColumn+" >= '"+minTime+"' AND "+ viewTable+"."+timeColumn+" <= '"+maxTime+"' ";
		if(joinRequired) {
			query+= " AND "+ joinTable1+"."+timeColumn+" >= '"+minTime+"' AND "+ joinTable1+"."+timeColumn+" <= '"+maxTime+"' ";
		}
		query+=		 (!conditions.isBlank() ? "AND " + conditions : "");
		 
//
//		String query = String.format("SELECT COUNT(*) AS counts FROM %s.%s WHERE %s <= '%s' %s", schema, viewTable,
//				timeColumn, maxTime != null ? maxTime : ConvertionFunction.convertDate(new Date()),
//				minTime != null ? "AND " + timeColumn + " >= '" + minTime + "'" : "");
//		if (null != conditions && !conditions.isBlank()) {
//			query += " AND " + conditions;
//		}
		return runQuery(query);
	}

	public Map<String, Object> getCharts() {
		String query = "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = '" + schema
				+ "'";
		List<Map<String, Object>> data = runQuery(query);

		Map<String, List<String>> tables = new HashMap<>();
		for (Map<String, Object> row : data) {
			String tableName = (String) row.get("table_name");
			String columnName = (String) row.get("column_name");
			if (!tables.containsKey(tableName)) {
				tables.put(tableName, new ArrayList<>());
			}
			tables.get(tableName).add(columnName);
		}

		Map<String, Object> response = new HashMap<>();
		response.put("tables", tables);
		return response;
	}

	public Map<String, Object> generateChart(Map<String, Object> payload) {
		String selectedTable = (String) payload.get("filterTable");
		String selectedColumn = (String) payload.get("filterColumn");
		int selectedLimit = (Integer) payload.get("filterSelect");

		String query = String.format("SELECT %s, COUNT(*) AS count FROM %s.%s GROUP BY %s ORDER BY count DESC LIMIT %d",
				selectedColumn, schema, selectedTable, selectedColumn, selectedLimit);
		List<Map<String, Object>> data = runQuery(query);

		Map<String, Object> response = new HashMap<>();
		response.put("result", data);
		return response;
	}

//	private List<Map<String, Object>> runQuery(String query) {
//		System.out.println("Query Started:"+query);
//		List<Map<String, Object>> result = new ArrayList<>();
//		try (Connection conn = connection.getConnection();
//				Statement stmt = conn.createStatement();
//				ResultSet rs = stmt.executeQuery(query)) {
//			System.out.println("Query Executed:"+query);
//			System.out.println("Data Started processing:"+query);
//			while (rs.next()) {
//				Map<String, Object> row = new HashMap<>();
//				for (int i = 1; i <= rs.getMetaData().getColumnCount(); i++) {
//					row.put(rs.getMetaData().getColumnName(i), rs.getObject(i));
//				}
//				result.add(row);
//			}
//			System.out.println("Data Processed:"+query);
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//		return result;
//	}
	private List<Map<String, Object>> runQuery(String query) {
		System.out.println("Query Started: " + query);
		List<Map<String, Object>> result = new ArrayList<>();

		try (Connection conn = connection.getConnection();
				Statement stmt = conn.createStatement();
				ResultSet rs = stmt.executeQuery(query)) {

			ResultSetMetaData metaData = rs.getMetaData();
			int columnCount = metaData.getColumnCount();
			List<String> columnNames = new ArrayList<>(columnCount);

			for (int i = 1; i <= columnCount; i++) {
				columnNames.add(metaData.getColumnName(i));
			}

			int id = 1;
			while (rs.next()) {
				Map<String, Object> row = new HashMap<>(columnCount);
				for (String columnName : columnNames) {
					//convert the arrayObject data to list
					Object obj = rs.getObject(columnName);
					if(null==obj) {
						row.put(columnName, "NULL");
					}
					else if(obj.getClass().toString().contains("XGArray")) {
						row.put(columnName, rs.getObject(columnName).toString());
						
					}else {
						row.put(columnName, rs.getObject(columnName));
					}
					
				}
				row.put("id", id++); // Add id field
				result.add(row);
			}

			System.out.println("Query Executed: " + query);
		} catch (SQLException e) {
			System.err.println("SQL Exception while executing query: " + query);
			e.printStackTrace();
		} catch (Exception e) {
			System.err.println("Exception while executing query: " + query);
			e.printStackTrace();
		}

		return result;
	}

	public List<Map<String, Object>> getTablefromDB() {
		String q_tables = "SELECT table_name as tablename FROM information_schema.tables where table_schema = '"
				+ schema + "'";

		List<Map<String, Object>> result = runQuery(q_tables);
		return result;
	}

	public Map<String, Object> filterTable(Map<String, Object> payload) {
		Map<String, Object> response = new HashMap<>();

		// Get columns
		List<Map<String, Object>> columns = getColumns(viewTable);
		response.put("columns", columns);

		// Fetch data
		String conditions = (String) payload.get("conditions");
		String minTime = (String) payload.get("minTime");
		String maxTime = (String) payload.get("maxTime");
		payload.put("columns", columns);
		// response.put("datas", fetchData(payload));
		// Run count
		List<Map<String, Object>> runcount = runCount(schema, viewTable, timeColumn, conditions, minTime, maxTime);
		response.put("runCount", runcount);
		System.out.println(runcount.toString());
		return response;
	}

	public List<Map<String, Object>> getColumns(String viewTable) {
		String query = "SELECT column_name FROM information_schema.columns WHERE table_name = '" + viewTable + "'";
		return runQuery(query);
	}

	// Run count
	public List<Map<String, Object>> runCount(String schema, String viewTable, String timeColumn, String conditions,
			String minTime, String maxTime) {
		if (maxTime == null)
			maxTime = ConvertionFunction.convertDate(new Date());
		if (minTime == null) {
			Calendar calendar = Calendar.getInstance();
			calendar.add(Calendar.DAY_OF_MONTH, -1);
			Date previousDate = calendar.getTime();
			minTime = ConvertionFunction.convertDate(previousDate);
		}

		String query = String.format("SELECT COUNT(*) AS counts FROM %s.%s WHERE %s <= '%s' %s", schema, viewTable,
				timeColumn, maxTime != null ? maxTime : ConvertionFunction.convertDate(new Date()),
				minTime != null ? "AND " + timeColumn + " >= '" + minTime + "'" : "");
		if (!conditions.isBlank()) {
			query += " AND " + conditions;
		}
		return runQuery(query);
	}

	public Map<String, Object> generateReport(String reportName) {
		Map<String, String> reportColumnsMap = reportConfig.getReportColumnsMap();
		Map<String, String> reportTablesMap = reportConfig.getReportTablesMap();
		Map<String, String> reportTimeColumnsMap = reportConfig.getReportTimeColumnsMap();

		if (!reportColumnsMap.containsKey(reportName) || !reportTablesMap.containsKey(reportName)
				|| !reportTimeColumnsMap.containsKey(reportName)) {
			return null;
		}

		String timeColumn = reportTimeColumnsMap.get(reportName);
		String table = reportTablesMap.get(reportName);
		String columnsString = reportColumnsMap.get(reportName);
		List<Map<String, Object>> columns = new ArrayList<>();
		if (columnsString != null && !columnsString.isEmpty()) {
			// Assuming columnsString is comma-separated column names
			String[] columnNames = columnsString.split(",");
			for (String columnName : columnNames) {
				Map<String, Object> columnMap = new HashMap<>();
				columnMap.put("column_name", columnName.trim());
				columns.add(columnMap);
			}
		}
		Map<String, Object> payload = new HashMap<String, Object>();
		payload.put("viewTable", table);
		payload.put("timeColumn", timeColumn);
		payload.put("columns", columns);
		payload.put("rowcount", rowCount);
		payload.put("minTime", null);
		payload.put("maxTime", null);

		System.out.println(payload.toString());
		return reportGenerator(payload);
	}

	private Map<String, Object> reportGenerator(Map<String, Object> payload) {
		Map<String, Object> filteredChart = getFilters(payload);
		Map<String, Object> fetchedData = fetchData(payload);

		Map<String, Object> report = new HashMap<>(payload);
		report.putAll(filteredChart);
		report.putAll(fetchedData);
		return report;
	}

	public List<String> getReports() {

		return reportConfig.getReportColumnsMap().keySet().stream().collect(Collectors.toList());
	}

}
