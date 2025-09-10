package br.furb.tccon.projeto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjetoUploadDTO {
    private String titulo;
    private String nomeDoArquivo;
    private String arquivoBase64;
}
