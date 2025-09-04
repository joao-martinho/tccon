package br.furb.tccon.professor;

import java.time.LocalDateTime;
import java.util.List;

import br.furb.tccon.aluno.AlunoModelo;
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

    private String telefone;

    List<AlunoModelo> alunos;

    private String senha;

    private String codigoDeVerificacao;
    
    private LocalDateTime criadoEm;

}
