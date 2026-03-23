package egovframework.com.feature.admin.service.model;

public class ControlPlaneCompareRow {

    private final String target;
    private final String currentRuntime;
    private final String generatedTarget;
    private final String proposalBaseline;
    private final String patchTarget;
    private final String result;

    public ControlPlaneCompareRow(String target,
                                  String currentRuntime,
                                  String generatedTarget,
                                  String proposalBaseline,
                                  String patchTarget,
                                  String result) {
        this.target = target;
        this.currentRuntime = currentRuntime;
        this.generatedTarget = generatedTarget;
        this.proposalBaseline = proposalBaseline;
        this.patchTarget = patchTarget;
        this.result = result;
    }

    public String getTarget() {
        return target;
    }

    public String getCurrentRuntime() {
        return currentRuntime;
    }

    public String getGeneratedTarget() {
        return generatedTarget;
    }

    public String getProposalBaseline() {
        return proposalBaseline;
    }

    public String getPatchTarget() {
        return patchTarget;
    }

    public String getResult() {
        return result;
    }
}
