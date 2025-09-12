package br.furb.tccon.documento;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
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
@Table(name = "projetos")
public class DocumentoModelo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String titulo;

    @NotBlank
    @Email
    private String emailAutor;

    @NotBlank
    private String nomeArquivo;

    @NotNull
    private LocalDateTime criadoEm;

    @NotBlank
    private String emailOrientador;

    @NotBlank
    private String emailCoorientador;

}
