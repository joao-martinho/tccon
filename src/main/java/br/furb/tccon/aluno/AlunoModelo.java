package br.furb.tccon.aluno;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
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
    @Column(name = "email", nullable = false, unique = true)
    private String email;
    
    @NotBlank
    private String nome;

    private String telefone;

    private String senha;
    
    @NotNull
    private String curso;

    @Email
    private String orientador;
    
    @Email
    private String coorientador;

    private String codigoVer;
    
    private LocalDateTime criadoEm;

}
