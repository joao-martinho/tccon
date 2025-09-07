package br.furb.tccon.professor;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "professores")
public class ProfessorModelo {
    
    @Id
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @NotBlank
    private String nome;

    private String telefone;

    List<String> orientandos;

    List<String> coorientandos;

    private String senha;

    private String codigoDeVerificacao;
    
    private LocalDateTime criadoEm;

}
