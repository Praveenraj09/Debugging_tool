package com.ocient.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.ocient.config.DatabaseConnection;
import com.ocient.config.ReportConfig;
import com.ocient.pojofunction.ConvertionFunction;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QueryService {

	private static final String q_schemas = "select schema_name as schemaname, count(schema_name) as countschema "
			+ "from information_schema.schemata " + "where schema_name != 'sys' and "
			+ "schema_name != 'information_schema' group by schema_name";

	private static final String q_fetchdashboard_table = "select distinct country_name as Country_Name,count(*) as counts from chicago.ip2location  group by country_name order by counts desc";

	
	@Autowired
	DatabaseConnection connection;

	@Autowired
	private ReportConfig reportConfig;

//	@Value("${ocient.db.dbname}")
//	private String db;

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
	
	@Value("${ocient.db.jointable2}")
	private String joinTable2;

	@Value("${ocient.db.jointable1_primaryid}")
	private String joinTable1PrimaryId;

	@Value("${ocient.db.viewable_primaryId}")
	private String viewable_primaryId;
	
	@Value("${ocient.db.jointable1_primaryid1}")
	private String joinTable1PrimaryId1;

	@Value("${ocient.db.viewable_primaryId1}")
	private String viewable_primaryId1;

	@Value("${ocient.db.defaultcolumn}")
	private String default_column;


	@Value("${ocient.db.rawdataTable}")
	private String rawtable;


	@Value("${ocient.db.rawTable_primaryid}")
	private String rawtable_primaryid;

	@Value("${ocient.db.defaultColumns_join}")
	private String default_column_join;
	
	@Value("${ocient.db.defaultColumns_nojoin}")
	private String default_column_nonjoin;




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

		System.out.println(payload.toString()+" "+selectedTable+" "+payload.get("filterSelect"));
		String selectedLimit = payload.get("filterSelect").toString();

		
		if (selectedLimit == null)
			selectedLimit = "10";
		
		System.out.println(payload.toString()+" "+selectedTable+" "+selectedLimit);
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

		query = "SELECT " + columnSelect + " FROM " + schema + "." + selectedTable + " LIMIT " + selectedLimit;
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
//	        queryBuilder.append("SELECT '").append(joinTable1).append("' || '.' || c1.column_name AS column_name, c1.data_type as data_type ")
//	                    .append("FROM information_schema.columns c1 ")
//	                    .append("WHERE c1.table_schema = '").append(schema).append("' ")
//	                    .append("AND c1.table_name = '").append(joinTable1).append("' ")
//	                    .append("UNION ALL ");
//
//	                
//	                queryBuilder.append("SELECT '").append(viewTable).append("' || '.' || c2.column_name AS column_name, c2.data_type as data_type  ")
//	                            .append("FROM information_schema.columns c2 ")
//	                            .append("LEFT JOIN information_schema.columns c1 ")
//	                            .append("ON c1.column_name = c2.column_name ")
//	                            .append("AND c1.table_name = '").append(joinTable1).append("' ")
//	                            .append("AND c1.table_schema = '").append(schema).append("' ")
//	                            .append("WHERE c2.table_schema = '").append(schema).append("' ")
//	                            .append("AND c2.table_name = '").append(viewTable).append("' ")
//	                            .append("AND c1.column_name IS NULL ");
	            
	                queryBuilder.append("SELECT '").append(joinTable1).append("'||'.' || column_name AS column_name, data_type ")
	                .append(" FROM information_schema.columns ")
	                .append(" WHERE table_schema = '").append(schema).append("' AND table_name = '").append(joinTable1).append("' ")	                
	                .append(" UNION ALL ");

	                queryBuilder.append("SELECT '").append(viewTable).append("'||'.' || column_name AS column_name, data_type ")
	                .append(" FROM information_schema.columns ")
	                .append(" WHERE table_schema = '").append(schema).append("' AND table_name = '").append(viewTable).append("' ")	                
	                .append(" AND column_name NOT IN (SELECT column_name FROM information_schema.columns WHERE table_schema = '")
	                .append(schema).append("' AND table_name = '").append(joinTable1).append("')")
	                .append(" UNION ALL ");

	                queryBuilder.append("SELECT '").append(joinTable2).append("'||'.' || column_name AS column_name, data_type ")
	                .append(" FROM information_schema.columns ")
	                .append(" WHERE table_schema = '").append(schema).append("' AND table_name = '").append(joinTable2).append("' ")	                
	                .append(" AND column_name NOT IN (SELECT column_name FROM information_schema.columns WHERE table_schema = '")
	                .append(schema).append("' AND table_name IN ('").append(viewTable).append("', '").append(joinTable1).append("') ) ");
	                
	                
 
	    } else {
	        // Select all columns from the primary table
	        queryBuilder.append("SELECT c.table_name || '.' || c.column_name AS column_name, c.data_type as data_type  ")
	                    .append("FROM information_schema.columns c ")
	                    .append("WHERE c.table_schema = '").append(schema).append("' ")
	                    .append("AND c.table_name = '").append(viewTable).append("' ");
	    }

	    queryBuilder.append(" ORDER BY column_name");
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
				List<Map<String, Object>> columns = (List<Map<String, Object>>) payload.get("columns");
				
				boolean isAuctionDetailsPresent = checkJoinTables(conditions,columns,"auction_details");
				
				boolean isRepositoryPresent = checkJoinTables(conditions,columns,"repository");

				String query = "";
				if(joinRequired) {
					query+="SELECT DATE_TRUNC('minute', "+ joinTable1+"."+timeColumn+") - INTERVAL '1 minute' * (EXTRACT(MINUTE FROM "+ joinTable1+"."+timeColumn+")::INT % "+chart_frequncy+") "
							+ " AS time_range_start, "
							+ " DATE_TRUNC('minute', "+ joinTable1+"."+timeColumn+") - INTERVAL '1 minute' * (EXTRACT(MINUTE FROM "+ joinTable1+"."+timeColumn+")::INT % "+chart_frequncy+") + "
							+ " INTERVAL '"+chart_frequncy+" minute' AS time_range_end, "
							+ " COUNT(*) AS record_count FROM "+schema+"."+joinTable1 ;
					if(isAuctionDetailsPresent) {
						query +=" LEFT OUTER JOIN "+schema+"."+viewTables+" ON "+ viewTables+"."+viewable_primaryId+" = "+joinTable1+"."+joinTable1PrimaryId+" AND "
								+ viewTables+"."+viewable_primaryId1+" = "+joinTable1+"."+joinTable1PrimaryId1+" ";
						
					}
					if(isRepositoryPresent) {
						query +=" LEFT OUTER JOIN "+schema+"."+joinTable2+" ON "+ joinTable2+"."+viewable_primaryId+" = "+joinTable1+"."+joinTable1PrimaryId+" AND "
								+ joinTable2+"."+viewable_primaryId1+" = "+joinTable1+"."+joinTable1PrimaryId1+" ";
						
					}
					
					query+= " WHERE "+joinTable1+"."+timeColumn+" >= '"+minTime+"' AND "+joinTable1+"."+timeColumn+" <= '"+maxTime+"' ";
							
					if(isAuctionDetailsPresent) {
						query+=" AND "+ viewTables+"."+timeColumn+" >= '"+minTime+"' AND "+ viewTables+"."+timeColumn+" <= '"+maxTime+"'   "+ " ";
					}
					if(isRepositoryPresent) {
						query+=" AND "+ joinTable2+"."+timeColumn+" >= '"+minTime+"' AND "+ joinTable2+"."+timeColumn+" <= '"+maxTime+"'   "+ " ";
					}
					query+= " "+(!conditions.isBlank() ? "AND " + conditions : "") +" "
								+ " GROUP BY time_range_start, time_range_end ORDER BY time_range_start DESC LIMIT "+chart_points;
					}
					
				
				else {
					query += String.format(
							"SELECT DATE_TRUNC('minute', %s) - INTERVAL '1 minute' * (EXTRACT(MINUTE FROM %s)::INT %% %d) AS time_range_start, "
									+ "DATE_TRUNC('minute', %s) - INTERVAL '1 minute' * (EXTRACT(MINUTE FROM %s)::INT %% %d) + INTERVAL '5 minute' AS time_range_end, "
									+ "COUNT(*) AS record_count FROM %s.%s GROUP BY time_range_start, time_range_end ORDER BY time_range_start DESC LIMIT %d",
							timeColumns, timeColumns,chart_frequncy, timeColumns, timeColumns,chart_frequncy, schema, viewTables, chart_points);
					
				}
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

	public static boolean checkJoinTables(String conditions, List<Map<String, Object>> columns, String valueToCheck) {
        // Check if conditions contain the valueToCheck
        boolean conditionsCheck = (conditions != null && conditions.toLowerCase().contains(valueToCheck));
        
        // Check if columns contain the valueToCheck in column_name
        boolean columnsCheck = (!columns.isEmpty() && columns.stream()
                                                             .anyMatch(column -> column.get("column_name") != null && 
                                                                                 column.get("column_name").toString().toLowerCase().contains(valueToCheck)));

        // Return true if either conditionsCheck or columnsCheck is true
        return conditionsCheck || columnsCheck;
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
		boolean isAuctionDetailsPresent = checkJoinTables(conditions,columns,"auction_details");
		
		boolean isRepositoryPresent = checkJoinTables(conditions,columns,"repository");

		 String columnNames = "";
		 if(joinRequired) {
			 columnNames += default_column_join ;			 
		 }
		 else {
			 columnNames += default_column_nonjoin;
		 }
		 System.out.println(columns.isEmpty());
		 if(columns != null && !columns.isEmpty()) {
			 columnNames+= " , ";
			 columnNames+= columns.stream()
		            .map(column -> {
		                String columnName = (String) column.get("column_name");
		                if ("auction.auctionid".equals(columnName) || "auction_details.auctionid".equals(columnName)) {
		                    return " SUBSTRING(char(" + columnName + "), 3) as \"" + columnName + "\" ";
		                } else {
		                    return columnName + " as \"" + columnName + "\" ";
		                }
		            })
		            .collect(Collectors.joining(", "));
		 }
		 
		String query ="";
		
		if(joinRequired) {
			query+="SELECT "+columnNames+" FROM "+schema+"."+joinTable1+" ";
			if(isAuctionDetailsPresent) {
				query+=" LEFT OUTER JOIN "+schema+"."+viewTables+" ON "+viewTables+"."+viewable_primaryId+" = "+joinTable1+"."+joinTable1PrimaryId+" AND "+ viewTables+"."+viewable_primaryId1+" = "+joinTable1+"."+joinTable1PrimaryId1+" ";				
			}
			if(isRepositoryPresent) {
				query+=" LEFT OUTER JOIN "+schema+"."+joinTable2+" ON "+joinTable2+"."+viewable_primaryId+" = "+joinTable1+"."+joinTable1PrimaryId+" AND "+ joinTable2+"."+viewable_primaryId1+" = "+joinTable1+"."+joinTable1PrimaryId1+" ";				
			}
			query+= " WHERE "+ joinTable1+"."+timeColumn+" >= '"+minTime+"' AND "+ joinTable1+"."+timeColumn+" <= '"+maxTime+"' ";
			
			if(isAuctionDetailsPresent) {
				query+= " AND "+ viewTables+"."+timeColumn+" >= '"+minTime+"' AND "+ viewTables+"."+timeColumn+" <= '"+maxTime+"' ";
			}
			if(isRepositoryPresent) {
				query+= " AND "+ joinTable2+"."+timeColumn+" >= '"+minTime+"' AND "+ joinTable2+"."+timeColumn+" <= '"+maxTime+"' ";
			}
			query+=		 (!conditions.isBlank() ? "AND " + conditions : "")+" LIMIT "+rowCount;
		}
		else {
			query+="SELECT "+columnNames+" FROM "+schema+"."+viewTable+" ";
			query+= " WHERE "+ viewTables+"."+timeColumn+" >= '"+minTime+"' AND "+ viewTables+"."+timeColumn+" <= '"+maxTime+"' ";
			query+=		 (!conditions.isBlank() ? "AND " + conditions : "")+" LIMIT "+rowCount;
		}
		

		// Log the constructed query for debugging

		// Execute the query and get data
		List<Map<String, Object>> data = runQuery(query);

		// Prepare response map
		Map<String, Object> response = new HashMap<>();
		response.put("datas", data);
		response.put("columns", columns);

		return response;
	}
	


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
						
					}
					else if(obj.getClass().toString().contains("class [B")) {
						//row.put(columnName, convertToHex(rs.getObject(columnName).toString()));
						//auction id changes binary to string
						row.put(columnName, rs.getObject(columnName).toString());
					}
					else if(obj.getClass().toString().contains("XGTimestamp")) {
						row.put(columnName, rs.getObject(columnName));
					}
					else {
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

	
//
//	public List<Map<String, Object>> getColumns() {
//		String query = "SELECT column_name FROM information_schema.columns WHERE table_name = '" + viewTable + "'";
//		return runQuery(query);
//	}

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

	public List<Map<String, Object>> getRawData(Map<String, Object> payload) {
		String auctionid = (String) payload.get("auctionid");
		String created = (String) payload.get("created");
		int recordtype = (int) payload.get("recordtype");
		String start = created.replace("T", " ").substring(0,19);
//		String temp= created.replace("T", " ");System.out.println(temp);
//		String[] value = temp.split("\\.",2);System.out.println(value.toString());
//		System.out.println(value[0]);
//		System.out.println(start+"."+value[1].replaceAll("[+:]","0"));
		
		String query = "SELECT rawrequest from "+schema+"."+rawtable+" WHERE ("+rawtable+"."+rawtable_primaryid +" = binary('0x"+auctionid+"')) AND "
				+ rawtable+"."+timeColumn+" >= '"+start+"' AND "
				+rawtable+"."+timeColumn+" <= DATEADD(minute,1, '"+start+"') "
				+" AND "+ rawtable+"."+joinTable1PrimaryId1+" = "+recordtype+"";
		return runQuery(query);
	}

	public List<Map<String, Object>> getAllData(Map<String, Object> payload) {
		List<Map<String, Object>> columns = (List<Map<String, Object>>) payload.get("columns");
		String auctionid = (String) payload.get("auctionid");
		String created = (String) payload.get("created");
		int recordtype = (int) payload.get("recordtype");
		String start = created.replace("T", " ").substring(0,19);

		String columnNames = "";
		 
		 if(columns != null && !columns.isEmpty()) {
			 columnNames+= columns.stream()
		            .map(column -> {
		                String columnName = (String) column.get("column_name");
		                if ("auction.auctionid".equals(columnName) || "auction_details.auctionid".equals(columnName)) {
		                    return " SUBSTRING(char(" + columnName + "), 3) as \"" + columnName + "\" ";
		                } else {
		                    return columnName + " as \"" + columnName + "\" ";
		                }
		            })
		            .collect(Collectors.joining(", "));
		 }
		String query = "SELECT "+columnNames+" from "+schema+"."+joinTable1+" ";
				if(joinRequired) {
					query+=" LEFT OUTER JOIN "+schema+"."+viewTable+" ON "+viewTable+"."+viewable_primaryId+" = "+joinTable1+"."+joinTable1PrimaryId+" AND "+ viewTable+"."+viewable_primaryId1+" = "+joinTable1+"."+joinTable1PrimaryId1+" ";
					query+=" LEFT OUTER JOIN "+schema+"."+joinTable2+" ON "+joinTable2+"."+viewable_primaryId+" = "+joinTable1+"."+joinTable1PrimaryId+" AND "+ joinTable2+"."+viewable_primaryId1+" = "+joinTable1+"."+joinTable1PrimaryId1+" ";
					
				}
				query+= " WHERE "+ viewTable+"."+timeColumn+" >= '"+start+"' AND "+ viewTable+"."+timeColumn+" <= DATEADD(second,1, '"+start+"')";
				if(joinRequired) {
					query+= " AND "+ joinTable1+"."+timeColumn+" >= '"+start+"' AND "+ joinTable1+"."+timeColumn+" <= DATEADD(second,1, '"+start+"')";
					query+=" AND ("+joinTable1+"."+rawtable_primaryid +" = binary('0x"+auctionid+"')) ";
					query+= " AND "+ joinTable2+"."+timeColumn+" >= '"+start+"' AND "+ joinTable2+"."+timeColumn+" <= DATEADD(minute,1, '"+start+"')";
					query+=" AND ("+joinTable2+"."+rawtable_primaryid +" = binary('0x"+auctionid+"')) ";
					
				}
				query+=" AND ("+viewTable+"."+rawtable_primaryid +" = binary('0x"+auctionid+"')) ";
		
		return runQuery(query);
	}

}
