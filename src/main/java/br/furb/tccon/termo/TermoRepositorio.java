package br.furb.tccon.termo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
public interface TermoRepositorio extends JpaRepository<TermoModelo, Long> {

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM termos", nativeQuery = true)
    void truncateTable();
    
}
