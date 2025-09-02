package br.furb.tccon.relatorio;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;

@CrossOrigin("*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/relatorios")
public class RelatorioControle {
    
    private final RelatorioServico relatorioServico;

    @GetMapping
    public ResponseEntity<Iterable<RelatorioModelo>> listarRelatorios() {
        return this.relatorioServico.listarRelatorios();
    }

    @PostMapping
    public ResponseEntity<RelatorioModelo> cadastrarRelatorio(@Valid @RequestBody RelatorioModelo RelatorioModelo) {
        return this.relatorioServico.cadastrarRelatorio(RelatorioModelo);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RelatorioModelo> buscarRelatorio(@PathVariable Long id) {
        return this.relatorioServico.buscarRelatorio(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RelatorioModelo> alterarRelatorioTotal(@Valid @PathVariable Long id, @RequestBody RelatorioModelo RelatorioModelo) {
        return this.relatorioServico.alterarRelatorioTotal(id, RelatorioModelo);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<RelatorioModelo> alterarRelatorioParcial(@PathVariable Long id, @RequestBody RelatorioModelo RelatorioModelo) {
        return this.relatorioServico.alterarRelatorioParcial(id, RelatorioModelo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerRelatorio(@PathVariable Long id) {
        return this.relatorioServico.removerRelatorio(id);
    }

    @DeleteMapping
    public void deletarTodos() {
        relatorioServico.removerTodos();
    }

}
