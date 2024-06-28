package com.ocient.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.ocient.config.ReportConfig;
import com.ocient.services.QueryService;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class DatabaseController {
	
	

	@Autowired
	private QueryService queryService;

	@Value("${ocient.db.schema}")
	public String schema;

	private static final String q_schemas = "select schema_name as schemaname, count(schema_name) as countschema "
			+ "from information_schema.schemata " + "where schema_name != 'sys' and "
			+ "schema_name != 'information_schema' group by schema_name";

	private static final String q_fetchdashboard_table = "select distinct country_name as Country_Name,count(*) as counts from chicago.ip2location  group by country_name order by counts desc";

	private Map<String, List<Map<String, Object>>> cachedTables = new HashMap<>();

	@GetMapping("/dashboard")
	public Map<String, Object> getDashboard() {
		return queryService.getDashboard();
	}

	@GetMapping("/tables")
	public List<Map<String, Object>> getTables() {
		return queryService.getTables();
	}

	@PostMapping("/tables")
	public Map<String, Object> getTableData(@RequestBody Map<String, Object> payload) {
		System.out.println("calling /tables");
		return queryService.getTableData(payload);
	}

	@GetMapping("/columns")
	public List<Map<String, Object>> getColumns() {
		System.out.println("calling /columns");
		return queryService.getColumns();
	}

	@GetMapping("/filters")
	public Map<String, Object> getFilters() {
		System.out.println("calling /filters");
		Map<String, Object> payload = new HashMap<String, Object>();		
		return queryService.getFilters(payload);
	}

	@PostMapping("/chart_data")
	public List<Map<String, Object>> getChartData(@RequestBody Map<String, String> payload) {
		System.out.println("calling /chart_data");
		return queryService.getChartData(payload);
	}

	 @PostMapping("/fetch_data")
	    public ResponseEntity<Map<String, Object>> fetchData(@RequestBody Map<String, Object> payload) {
	        System.out.println("calling /fetch_data");

	        Map<String, Object> result = queryService.fetchData(payload);

	        if (result != null) {
	            return ResponseEntity.ok(result);
	        } else {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
	        }
	    }

	@PostMapping("/run_count")
	public List<Map<String, Object>> runCount(@RequestBody Map<String, Object> payload) {
		System.out.println("calling /run_count");
		System.out.println(payload.toString());
		return queryService.runCount(payload);
	}

	@GetMapping("/charts")
	public Map<String, Object> getCharts() {
		System.out.println("calling /charts");
		return queryService.getCharts();
	}

	@PostMapping("/charts")
	public Map<String, Object> generateChart(@RequestBody Map<String, Object> payload) {
		return queryService.generateChart(payload);
	}

	@GetMapping("/fetch_TableInfo")
	public Map<String, Object> fetch_TableInfo() throws SQLException {
		System.out.println("calling /fetch_TableInfo");
		return queryService.fetch_TableInfo();
	}
	 @PostMapping("/filter_table")
	    public Map<String, Object> filterTable(@RequestBody Map<String, Object> payload) {
		 System.out.println("calling /filter_table");
	       return queryService.filterTable(payload);
	    }
	
	@GetMapping("/logout")
	public Map<String, String> logout(HttpServletRequest request, HttpServletResponse response) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null) {
			new SecurityContextLogoutHandler().logout(request, response, auth);
		}
		return Map.of("redirect", "/login");
	}
	
	
    @GetMapping("/report")
    public ResponseEntity<List<String>> getReports() {
    	System.out.println("calling /report");
        List<String> reports = queryService.getReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/report/{reportName}")
    public ResponseEntity<Map<String, Object>> getReportData(@PathVariable String reportName) {
    	System.out.println("calling /reportName");
    	Map<String, Object> map =  queryService.generateReport(reportName);
        return ResponseEntity.ok(map);
    }
}
