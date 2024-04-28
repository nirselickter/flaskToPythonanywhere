function isValidIpAddress(ip) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
}




// ...
function addRuleToTable(rule) {
    const ruleRow = `<tr data-rule-id="${rule.id}">
        <td><input type="text" class="form-control" value="${rule.username}" /></td>
        <td><input type="text" class="form-control" value="${rule.source_ip}" /></td>
        <td><input type="text" class="form-control" value="${rule.destination_ip}" /></td>
        <td><input type="number" class="form-control" value="${rule.port}" min="1" max="65535" /></td>
        <td>
            <select class="form-control">
                <option value="TCP" ${rule.protocol === "TCP" ? "selected" : ""}>TCP</option>
                <option value="UDP" ${rule.protocol === "UDP" ? "selected" : ""}>UDP</option>
                <option value="ICMP" ${rule.protocol === "ICMP" ? "selected" : ""}>ICMP</option>
            </select>
        </td>
        <td>
            <select class="form-control">
                <option value="Allow" ${rule.action === "Allow" ? "selected" : ""}>Allow</option>
                <option value="Block" ${rule.action === "Block" ? "selected" : ""}>Block</option>
            </select>
        </td>
        <td>
            <button class="btn btn-primary editRule">Save</button>
            <button class="btn btn-danger deleteRule">Delete</button>
        </td>
    </tr>`;
    $("#rulesTable tbody").append(ruleRow);
}

function loadRules() {
    $.getJSON("/get_rules", function(rules) {
        for (const rule of rules) {
            addRuleToTable(rule);
        }
    });
}


// Call loadRules when the document is ready
$(document).ready(function() {
    loadRules();
});


$("#ruleForm").on("submit", function(event) {
    event.preventDefault();

    const username = $("#username").val();
    const sourceIp = $("#source_ip").val();
    const destinationIp = $("#destination_ip").val();
    const port = $("#port").val();

    if (!isValidIpAddress(sourceIp) || !isValidIpAddress(destinationIp)) {
        alert("Invalid IP address.");
        return;
    }

    const formData = $(this).serialize();
    $.post("/add_rule", formData, function(response) {
        if (response.success) {
            const rule = response.rule;
            addRuleToTable(rule);
        } else {
            alert("Failed to add rule.");
        }
    });
});


$(document).on("click", ".editRule", function() {
    const row = $(this).closest("tr");
    const ruleId = row.data("ruleId");

    // Update the rule values in the table row
    const updatedRule = {
        username: row.find("td:eq(0) input").val(),
        source_ip: row.find("td:eq(1) input").val(),
        destination_ip: row.find("td:eq(2) input").val(),
        port: row.find("td:eq(3) input").val(),
        protocol: row.find("td:eq(4) select").val(),
        action: row.find("td:eq(5) select").val()
    };

    $.ajax({
        url: `/edit_rule/${ruleId}`,
        method: "PUT",
        data: updatedRule,
        success: function(response) {
            if (!response.success) {
                alert("Failed to edit rule.");
            }
        }
    });
});



$(document).on("click", ".deleteRule", function() {
    const row = $(this).closest("tr");
    const ruleId = row.data("ruleId");

    $.ajax({
        url: `/delete_rule/${ruleId}`,
        method: "DELETE",
        success: function(response) {
            if (response.success) {
                row.remove();
            } else {
                alert("Failed to delete rule.");
            }
        }
    });
});

