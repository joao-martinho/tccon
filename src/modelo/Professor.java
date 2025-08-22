@Entity
@Table(name = "professores")
public class Professor extends Usuario {

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private Set<Papel> papeis = new HashSet<>();
}
