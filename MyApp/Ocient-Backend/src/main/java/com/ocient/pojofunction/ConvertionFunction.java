package com.ocient.pojofunction;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

public class ConvertionFunction {
	
	public static String convertDate(Object object) {
	    try {
	        Date currentDate = (Date) object;

	        // Create a SimpleDateFormat object with GMT time zone
	        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));

	        // Format the date to GMT
	        String gmtDate = sdf.format(currentDate);

	        return gmtDate;
	    } catch (Exception e) {
	        // Handle any parsing errors
	        e.printStackTrace();
	        return null;
	    }
	}
}
