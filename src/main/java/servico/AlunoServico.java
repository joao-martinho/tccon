package servico;

import modelo.Aluno;
import org.springframework.stereotype.Service;
import repositorio.AlunoRepositorio;

@Service
public class AlunoServico {
    private AlunoRepositorio alunoRepositorio;

    // construtor com todos os argumentos
    public AlunoServico(AlunoRepositorio alunoRepositorio) {
        this.alunoRepositorio = alunoRepositorio;
    }

    // construtor sem argumentos
    public AlunoServico() {
        // intencionalmente vazio
    }

    public Aluno salvar(Aluno aluno) {
        // TODO
        return null;
    }

    public Aluno buscarPorId(Long id) {
        // TODO
        return null;
    }
}
