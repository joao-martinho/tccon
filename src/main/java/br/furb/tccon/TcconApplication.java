package br.furb.tccon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TcconApplication {

	public static void main(String[] args) {
		SpringApplication.run(TcconApplication.class, args);
	}

}
