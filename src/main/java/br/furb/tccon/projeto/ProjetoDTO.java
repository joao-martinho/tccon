package br.furb.tccon.projeto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ProjetoDTO {
    private Long id;
    private String titulo;
    private String autor;
    private String nomeArquivo;
    private String criadoEm;
    private String arquivoBase64;  
}
