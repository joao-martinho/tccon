package br.furb.tccon.termo;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
    @Email
    private String emailDoAluno;

    @NotBlank
    @Email
    private String emailDoOrientador;

    @Email
    private String emailDoCoorientador;

    @Lob
    private String perfilDoCoorientador;

    @NotBlank
    private String ano;

    @NotBlank
    private String semestre;

    @NotBlank
    @Lob
    private String resumo;

    private String statusDoOrientador;

    private String statusDoCoorientador;
    
}
