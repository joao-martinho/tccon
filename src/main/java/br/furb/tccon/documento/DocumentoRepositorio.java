package br.furb.tccon.documento;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
public interface DocumentoRepositorio extends JpaRepository<DocumentoModelo, Long> {

    List<DocumentoModelo> findByEmailAutor(String email);
    List<DocumentoModelo> findByEmailOrientador(String emailOrientador);
    List<DocumentoModelo> findByEmailCoorientador(String emailCoorientador);
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM projetos", nativeQuery = true)
    void truncateTable();

}
