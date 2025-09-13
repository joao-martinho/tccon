package br.furb.tccon.documento;

import java.time.LocalDateTime;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "documentos")
public class DocumentoModelo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String titulo;

    @NotBlank
    @Email
    private String emailAutor;

    @Email
    private String emailOrientador;

    @Email
    private String emailCoorientador;

    @NotBlank
    private String nomeArquivo;

    @NotNull
    @Lob
    private String arquivoBase64;

    @NotNull
    private LocalDateTime criadoEm;

    @PrePersist
    public void prePersist() {
        if (criadoEm == null) {
            criadoEm = LocalDateTime.now();
        }
    }

    public DocumentoModelo() {}

    public DocumentoModelo(String titulo, String emailAutor, String emailOrientador,
                           String emailCoorientador, String nomeArquivo, String arquivoBase64) {
        this.titulo = titulo;
        this.emailAutor = emailAutor;
        this.emailOrientador = emailOrientador;
        this.emailCoorientador = emailCoorientador;
        this.nomeArquivo = nomeArquivo;
        this.arquivoBase64 = arquivoBase64;
    }
}
