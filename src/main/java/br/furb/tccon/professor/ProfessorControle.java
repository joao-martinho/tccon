package br.furb.tccon.professor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin("*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/professores")
public class ProfessorControle {

    private final ProfessorServico professorServico;

    @GetMapping
    public ResponseEntity<Iterable<ProfessorModelo>> listarProfessores() {
        return this.professorServico.listarProfessores();
    }

    @PostMapping
    public ResponseEntity<ProfessorModelo> cadastrarProfessor(@Valid @RequestBody ProfessorModelo professorModelo) {
        return this.professorServico.cadastrarProfessor(professorModelo);
    }

    @GetMapping("/{email}")
    public ResponseEntity<ProfessorModelo> buscarProfessor(@PathVariable String email) {
        return this.professorServico.localizarProfessor(email);
    }

    @PutMapping("/{email}")
    public ResponseEntity<ProfessorModelo> alterarProfessorTotal(@Valid @PathVariable String email, @RequestBody ProfessorModelo professorModelo) {
        return this.professorServico.alterarProfessorTotal(email, professorModelo);
    }

    @PatchMapping("/{email}")
    public ResponseEntity<ProfessorModelo> alterarProfessorParcial(@PathVariable String email, @RequestBody ProfessorModelo professorModelo) {
        return this.professorServico.alterarProfessorParcial(email, professorModelo);
    }

    @DeleteMapping("/{email}")
    public ResponseEntity<Void> removerProfessor(@PathVariable String email) {
        return this.professorServico.removerProfessor(email);
    }

    @DeleteMapping
    public void deletarTodos() {
        professorServico.removerTodos();
    }

}
