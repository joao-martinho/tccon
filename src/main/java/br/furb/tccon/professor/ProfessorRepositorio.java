package br.furb.tccon.professor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
public interface ProfessorRepositorio extends JpaRepository<ProfessorModelo, String> {
    
    ProfessorModelo findByEmail(String email);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM professores", nativeQuery = true)
    void truncateTable();

}
