package br.furb.tccon.aluno;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
public interface AlunoRepositorio extends JpaRepository<AlunoModelo, String> {
    
    AlunoModelo findByEmail(String email);

    @Modifying
    @Transactional
    @Query("UPDATE AlunoModelo a SET a.codigoDeVerificacao = NULL " + "WHERE a.criadoEm <= :limite")
    int limparCodigoDeVerificacao(@Param("limite") LocalDateTime limite);
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM alunos", nativeQuery = true)
    void truncateTable();

}
