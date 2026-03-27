package egovframework.com.feature.auth.domain.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "COMTNPASSWORDRESETHIST")
public class PasswordResetHistory {

    @Id
    @Column(name = "HIST_ID")
    private String histId;

    @Column(name = "TARGET_USER_ID")
    private String targetUserId;

    @Column(name = "TARGET_USER_SE")
    private String targetUserSe;

    @Column(name = "RESET_SOURCE")
    private String resetSource;

    @Column(name = "RESET_BY_USER_ID")
    private String resetByUserId;

    @Column(name = "RESET_IP")
    private String resetIp;

    @Column(name = "RESET_PNTTM")
    private LocalDateTime resetPnttm;

    public String getTargetUserId() {
        return targetUserId;
    }

    public String getTargetUserSe() {
        return targetUserSe;
    }

    public String getResetSource() {
        return resetSource;
    }

    public String getResetByUserId() {
        return resetByUserId;
    }

    public String getResetIp() {
        return resetIp;
    }

    public LocalDateTime getResetPnttm() {
        return resetPnttm;
    }
}
