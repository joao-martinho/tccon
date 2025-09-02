package br.furb.tccon.aluno;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "alunos")
public class AlunoModelo {

    @Id
    @Email
    private String email;
    
    @NotBlank
    private String nome;

    private String senha;
    
    @NotNull
    private String curso;

    private String codigoDeVerificacao;
    
    private LocalDateTime criadoEm;

}
