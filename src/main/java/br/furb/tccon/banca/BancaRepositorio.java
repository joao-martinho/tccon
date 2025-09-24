package br.furb.tccon.banca;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
public interface BancaRepositorio extends JpaRepository<BancaModelo, Long> {
    
    BancaModelo findByEmailAluno(String emailAluno);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM bancas", nativeQuery = true)
    void truncateTable();

}
