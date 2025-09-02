package br.furb.tccon.relatorio;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RelatorioServico {
    
    private final RelatorioRepositorio relatorioRepositorio;

    public ResponseEntity<Iterable<RelatorioModelo>> listarRelatorios() {
        return new ResponseEntity<>(this.relatorioRepositorio.findAll(), HttpStatus.OK);
    }

    public ResponseEntity<RelatorioModelo> cadastrarRelatorio(RelatorioModelo RelatorioModelo) {
        return new ResponseEntity<>(this.relatorioRepositorio.save(RelatorioModelo), HttpStatus.CREATED);
    }

    public ResponseEntity<RelatorioModelo> alterarRelatorioTotal(Long id, RelatorioModelo RelatorioModelo) {
        Optional<RelatorioModelo> optional = this.relatorioRepositorio.findById(id);
        
        if (optional.isPresent()) {
            RelatorioModelo.setId(id);
            return new ResponseEntity<>(this.relatorioRepositorio.save(RelatorioModelo), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<RelatorioModelo> alterarRelatorioParcial(Long id, RelatorioModelo relatorioModelo) {
        Optional<RelatorioModelo> optional = this.relatorioRepositorio.findById(id);

        if (optional.isPresent()) {
            RelatorioModelo relatorioModelo2 = optional.get();

            if (relatorioModelo.getTitulo() != null) {
                relatorioModelo2.setTitulo(relatorioModelo.getTitulo());
            }

            if (relatorioModelo.getDataDeInicio() != null) {
                relatorioModelo2.setDataDeInicio(relatorioModelo.getDataDeInicio());
            }

            if (relatorioModelo.getDataDeFim() != null) {
                relatorioModelo2.setDataDeFim(relatorioModelo.getDataDeFim());
            }

            if (relatorioModelo.getHorasTrabalhadas() != null) {
                relatorioModelo2.setHorasTrabalhadas(relatorioModelo.getHorasTrabalhadas());
            }

            return new ResponseEntity<>(this.relatorioRepositorio.save(relatorioModelo2), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerRelatorio(Long id) {
        boolean existeid = this.relatorioRepositorio.existsById(id);

        if (existeid) {
            this.relatorioRepositorio.deleteById(id);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<RelatorioModelo> buscarRelatorio(Long id) {
        boolean existeId = this.relatorioRepositorio.existsById(id);

        if (existeId) {
            Optional<RelatorioModelo> optional = this.relatorioRepositorio.findById(id);

            RelatorioModelo RelatorioModelo = optional.get();

            return new ResponseEntity<>(RelatorioModelo, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerTodos() {
        this.relatorioRepositorio.truncateTable();
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
