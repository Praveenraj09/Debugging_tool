package com.ocient.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.ocient.annotation.IsAuthenticated;
import com.ocient.services.QueryService;
import io.jsonwebtoken.security.Keys;

import java.util.Base64;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.crypto.SecretKey;
import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000,http://localhost:3001")
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

	@PostMapping("/login")
	public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, Object> loginRequest) {
	    System.out.println("Calling login");
	    Map<String, String> userMap = getUser();
	    System.out.println("User Map: " + userMap);

	    String usernamegot = (String) loginRequest.get("username");
	    String passwordgot = (String) loginRequest.get("password");

	    System.out.println("Username: " + usernamegot);
	    System.out.println("Password: " + passwordgot);

	    String storedPassword = userMap.get(usernamegot);
	    if (storedPassword != null && storedPassword.equals(passwordgot)) {
	        // Generate JWT token
	        System.out.println("Inside token generation");
	        String token =" ";
	        try {
	        	SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
	            token = Base64.getEncoder().encodeToString(key.getEncoded());       
	        
	        }catch(Exception e) {
	        	e.printStackTrace();
	        }
	        Map<String, String> response = new HashMap<>();
	        response.put("token", token);
	        System.out.println("Generated Token: " + token);
	        return ResponseEntity.ok(response);
	    } else {
	        System.out.println("Unauthorized: Invalid username or password");
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
	    }
	}

	private Map<String, String> getUser() {
        Map<String, String> userMap = new HashMap<>();
        userMap.put("admin", "password"); // Example user: admin with password: password
        return userMap;
    }
	@GetMapping("/dashboard")
	@IsAuthenticated
	public Map<String, Object> getDashboard(HttpServletRequest request) {

	    return queryService.getDashboard();
	}

	@GetMapping("/")
	
	public String getwelcome() {
	return "Welcome";
	}

	@GetMapping("/tables")
	@IsAuthenticated
	public List<Map<String, Object>> getTables() {
		return queryService.getTables();
	}

	@PostMapping("/tables")
	@IsAuthenticated
	public Map<String, Object> getTableData(@RequestBody Map<String, Object> payload) {
		System.out.println("calling /tables");
		return queryService.getTableData(payload);
	}

	@GetMapping("/columns")
	@IsAuthenticated
	public List<Map<String, Object>> getColumns() {
		System.out.println("calling /columns");
		return queryService.getColumns();
	}

	@PostMapping("/filters")
	@IsAuthenticated
	public Map<String, Object> getFilters(@RequestBody Map<String, Object> payload) {
		System.out.println("calling /filters");
				
		return queryService.getFilters(payload);
	}
//
//	@PostMapping("/chart_data")
//	public List<Map<String, Object>> getChartData(@RequestBody Map<String, String> payload) {
//		System.out.println("calling /chart_data");
//		return queryService.getChartData(payload);
//	}

	 @PostMapping("/fetch_data")
	 @IsAuthenticated
	    public ResponseEntity<Map<String, Object>> fetchData(@RequestBody Map<String, Object> payload) {
	        System.out.println("calling /fetch_data");

	        Map<String, Object> result = queryService.fetchData(payload);

	        if (result != null) {
	            return ResponseEntity.ok(result);
	        } else {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
	        }
	    }

//	@PostMapping("/run_count")
//	public List<Map<String, Object>> runCount(@RequestBody Map<String, Object> payload) {
//		System.out.println("calling /run_count");
//		System.out.println(payload.toString());
//		return queryService.runCount(payload);
//	}
//
//	@GetMapping("/charts")
//	public Map<String, Object> getCharts() {
//		System.out.println("calling /charts");
//		return queryService.getCharts();
//	}
//
//	@PostMapping("/charts")
//	public Map<String, Object> generateChart(@RequestBody Map<String, Object> payload) {
//		return queryService.generateChart(payload);
//	}
//
	@GetMapping("/fetch_TableInfo")
	@IsAuthenticated
	public Map<String, Object> fetch_TableInfo() throws SQLException {
		System.out.println("calling /fetch_TableInfo");
		return queryService.fetch_TableInfo();
	}
//	 @PostMapping("/filter_table")
//	    public Map<String, Object> filterTable(@RequestBody Map<String, Object> payload) {
//		 System.out.println("calling /filter_table");
//	       return queryService.filterTable(payload);
//	    }
	
	
	
    @GetMapping("/report")
    @IsAuthenticated
    public ResponseEntity<List<String>> getReports() {
    	System.out.println("calling /report");
        List<String> reports = queryService.getReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/report/{reportName}")
    @IsAuthenticated
    public ResponseEntity<Map<String, Object>> getReportData(@PathVariable String reportName) {
    	System.out.println("calling /reportName");
    	Map<String, Object> map =  queryService.generateReport(reportName);
        return ResponseEntity.ok(map);
    }
    
    @PostMapping("/getRawdata")
    @IsAuthenticated
    public List<Map<String, Object>> getRawData(@RequestBody Map<String, Object> payload) {
		return queryService.getRawData(payload);
	}
    
    @PostMapping("/getAllData")
    @IsAuthenticated
    public List<Map<String, Object>> getAllData(@RequestBody Map<String, Object> payload) {
		return queryService.getAllData(payload);
	}
    
    
    public static class LoginRequest {
        private String username;
        private String password;

        // Getters and setters
        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}

