package egovframework.com.feature.auth.domain.repository;

import egovframework.com.feature.auth.domain.entity.PasswordResetHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PasswordResetHistoryRepository extends JpaRepository<PasswordResetHistory, String> {

    List<PasswordResetHistory> findTop10ByTargetUserIdOrderByResetPnttmDesc(String targetUserId);

    List<PasswordResetHistory> findAllByOrderByResetPnttmDesc();
}
