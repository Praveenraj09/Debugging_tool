package com.ocient.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import javax.annotation.PostConstruct;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class ReportConfig {

	@Autowired
	private Environment env;

	private Map<String, String> reportColumnsMap = new HashMap<>();
	private Map<String, String> reportTimeColumnsMap = new HashMap<>();
	private Map<String, String> reportTablesMap = new HashMap<>();

	@PostConstruct
	public void init() {
		String reportList = env.getProperty("report");
		if (reportList != null) {
			String[] reports = reportList.split(",");
			for (String report : reports) {
				String columns = env.getProperty(report + "_column");
				String timeColumn = env.getProperty(report + "_timecolumn");
				String table = env.getProperty(report + "_tablename");
				reportColumnsMap.put(report, columns);
				reportTablesMap.put(report, table);
				reportTimeColumnsMap.put(report, timeColumn);
			}
		}
	}

	

	public Map<String, String> getReportColumnsMap() {
		return reportColumnsMap;
	}

	public Map<String, String> getReportTablesMap() {
		return reportTablesMap;
	}

	public Map<String, String> getReportTimeColumnsMap() {
		return reportTimeColumnsMap;
	}
}
