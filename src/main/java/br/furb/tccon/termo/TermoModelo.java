package br.furb.tccon.termo;

import br.furb.tccon.aluno.AlunoModelo;
import br.furb.tccon.professor.ProfessorModelo;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "termos")
public class TermoModelo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String titulo;

    @NotBlank
    private AlunoModelo aluno;

    @NotNull
    private ProfessorModelo orientador;

    @NotNull
    private boolean temCoorientador;

    private ProfessorModelo coorientador;

    @Lob
    private String perfilDoCoorientador;

    @NotBlank
    private String tituloDoTrabalho;

    @NotBlank
    private String ano;

    @NotBlank
    private String semestre;

    @NotBlank
    @Lob
    private String resumoDoProblema;
    
}
