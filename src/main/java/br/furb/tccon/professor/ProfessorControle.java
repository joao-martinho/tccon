package br.furb.tccon.professor;

import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
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

import br.furb.tccon.aluno.AlunoModelo;
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

    @GetMapping("/orientandos/{email}")
    public ResponseEntity<Iterable<AlunoModelo>> listarOrientandos(@PathVariable String email) {
        return this.professorServico.listarOrientandos(email);
    }

    @GetMapping("/orientandos-provisorios/{email}")
    public ResponseEntity<Iterable<AlunoModelo>> listarOrientandosProvisorios(@PathVariable String email) {
        return this.professorServico.listarOrientandosProvisorios(email);
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

    @PatchMapping("/remover-provisorio/{email}/{emailAluno}")
    public ResponseEntity<AlunoModelo> removerProvisorio(@PathVariable String email, @PathVariable String emailAluno) {
        return this.professorServico.removerProvisorio(email, emailAluno);
    }

    @PatchMapping("/{email}")
    public ResponseEntity<ProfessorModelo> alterarProfessorParcial(@PathVariable String email, @RequestBody ProfessorModelo professorModelo) {
        return this.professorServico.alterarProfessorParcial(email, professorModelo);
    }

    @PatchMapping("/prof-tcc1/adicionar/{email}")
    public ResponseEntity<ProfessorModelo> tornarProfTcc1(@PathVariable String email) {
        return this.professorServico.adicionarPapel(email, PapelProfessor.PROF_TCC1);
    }

    @PatchMapping("/prof-tcc1/remover/{email}")
    public ResponseEntity<ProfessorModelo> removerProfTcc1(@PathVariable String email) {
        return this.professorServico.removerPapel(email, PapelProfessor.PROF_TCC1);
    }

    @PatchMapping("/prof-tcc2/adicionar/{email}")
    public ResponseEntity<ProfessorModelo> tornarProfTcc2(@PathVariable String email) {
        return this.professorServico.adicionarPapel(email, PapelProfessor.PROF_TCC2);
    }

    @PatchMapping("/prof-tcc2/remover/{email}")
    public ResponseEntity<ProfessorModelo> removerProfTcc2(@PathVariable String email) {
        return this.professorServico.removerPapel(email, PapelProfessor.PROF_TCC2);
    }

    @PatchMapping("/coord-bcc/adicionar/{email}")
    public ResponseEntity<ProfessorModelo> tornarCoordBcc(@PathVariable String email) {
        return this.professorServico.adicionarPapel(email, PapelProfessor.COORD_BCC);
    }

    @PatchMapping("/coord-bcc/remover/{email}")
    public ResponseEntity<ProfessorModelo> removerCoordBcc(@PathVariable String email) {
        return this.professorServico.removerPapel(email, PapelProfessor.COORD_BCC);
    }

    @PatchMapping("/coord-sis/adicionar/{email}")
    public ResponseEntity<ProfessorModelo> tornarCoordSis(@PathVariable String email) {
        return this.professorServico.adicionarPapel(email, PapelProfessor.COORD_SIS);
    }

    @PatchMapping("/coord-sis/remover/{email}")
    public ResponseEntity<ProfessorModelo> removerCoordenador(@PathVariable String email) {
        return this.professorServico.removerPapel(email, PapelProfessor.COORD_SIS);
    }

    @DeleteMapping("/{email}")
    public ResponseEntity<Void> removerProfessor(@PathVariable String email) {
        return this.professorServico.removerProfessor(email);
    }

    @DeleteMapping
    public void deletarTodos() {
        professorServico.removerTodos();
    }

    @Scheduled(fixedRate = 600_000)
    public void limparCodigoVer() {
        professorServico.limparCodigoVer();
    }
}
