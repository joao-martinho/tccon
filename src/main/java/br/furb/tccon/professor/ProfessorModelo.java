package br.furb.tccon.professor;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "professores")
public class ProfessorModelo {
    
    @Id
    @Email
    private String email;

    @NotBlank
    private String nome;

    private String senha;

}
