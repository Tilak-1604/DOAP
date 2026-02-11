package com.DOAP;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
@EnableAsync
public class DoapApplication {

	public static void main(String[] args) {
		System.out.println("tixlak");

		SpringApplication.run(DoapApplication.class, args);
	}

}
