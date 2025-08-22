package controle;

import modelo.Aluno;
import org.springframework.web.bind.annotation.*;
import servico.AlunoServico;

@RestController
@RequestMapping("/alunos")
public class AlunoControle {
    private AlunoServico alunoServico;

    // construtor com todos os argumentos
    public AlunoControle(AlunoServico alunoServico) {
        this.alunoServico = alunoServico;
    }

    // construtor sem argumentos
    public AlunoControle() {
        // intencionalmente vazio
    }

    @PostMapping
    public Aluno cadastrarAluno(@RequestBody Aluno aluno) {
        return alunoServico.salvar(aluno);
    }

    @GetMapping("/{id}")
    public Aluno buscarAluno(@PathVariable Long id) {
        return alunoServico.buscarPorId(id);
    }
}
