def manager_agent(results):
    issues = []
    for r in results:
        if r["status"] == "fail":
            issues.append(r)
        if issues:
            return {
                "decision" : "HOLD",
                "issues" : issues
            }   
    return {
            "decision" : "APPROVE",
            "issues" : []
        }