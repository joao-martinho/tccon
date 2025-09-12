package br.furb.tccon.documento;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DocumentoDTO {
    private Long id;
    private String titulo;
    private String emailAutor;
    private String nomeArquivo;
    private String criadoEm;
    private String arquivoBase64;  
    private String emailOrientador;
    private String emailCoorientador;
}
