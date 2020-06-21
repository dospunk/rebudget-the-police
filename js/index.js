var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var g_copBlue = "#0000ff";
var g_budgetAdjustmentsDisplay = "block";
var g_chart;
var g_departmentOptions = [];
var g_originalBudgetValues = [];
var g_policeLabel;
$(document).ready(function () {
    $('.select2').select2();
    $('#budgetSelectForm').submit(function (evt) {
        evt.preventDefault();
        var form = evt.currentTarget;
        var fd = new FormData(form);
        var dataPath = "data/" + fd.get("state") + "/" + fd.get("city") + "/" + fd.get("year") + ".json";
        $.getJSON(dataPath, function (data) {
            console.dir(data); //DEV
            for (var i = 0; i < data.excludes.length; i++) {
                delete data.budget[data.excludes[i]];
            }
            g_policeLabel = data.policeLabel;
            createGraph(data);
            showAdjustmentControls();
            discloseExcludes(data.excludes);
            showLinkToBudget(data.link);
        });
    });
});
function createGraph(data) {
    var budgetObj = data.budget;
    var budget = [];
    for (var department in budgetObj) {
        if (budgetObj.hasOwnProperty(department)) {
            budget.push([department, budgetObj[department]]);
        }
    }
    budget.sort(function (a, b) {
        return b[1] - a[1];
    });
    var departments = budget.map(function (elem) { return elem[0]; });
    var values = budget.map(function (elem) { return elem[1]; });
    g_originalBudgetValues = __spreadArrays(values);
    createDepartmentOptionsArray(departments, data.policeLabel);
    var colors = randomColor({ count: departments.length });
    colors[departments.indexOf(data.policeLabel)] = g_copBlue;
    var ctx = $("#graph")[0].getContext('2d');
    g_chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: departments,
            datasets: [{
                    data: values,
                    borderWidth: 1,
                    backgroundColor: colors
                }]
        }
    });
}
function showAdjustmentControls() {
    /*$.each($(".receivingDepartment"), (idx, val)=>{
        for (let i = 0; i < g_departmentOptions.length; i++) {
            val.append(g_departmentOptions[i]);
        }
    });*/
    $("#budgetAdjustments").html("");
    addAdjustmentLine();
    $("#budgetAdjustmentsContainer").show();
}
function createDepartmentOptionsArray(departments, policeLabel) {
    var sortedDepts = __spreadArrays(departments).sort();
    $.each(departments, function (idx, val) {
        if (val !== policeLabel) {
            var elem = document.createElement("option");
            elem.innerHTML = val;
            elem.setAttribute("value", val);
            g_departmentOptions.push(elem);
        }
    });
}
function addAdjustmentLine() {
    var optionsString = "";
    for (var i = 0; i < g_departmentOptions.length; i++) {
        optionsString += g_departmentOptions[i].outerHTML;
    }
    $("#budgetAdjustments").append("\n    <div class=\"adjustment\">\n        Move <input type=\"number\" min=\"0\" max=\"100\" class=\"adjustmentAmount\" value=\"0\">%\n        of the police budget to <select class=\"receivingDepartment select2\">" + optionsString + "</select>\n        <button onclick=\"removeAdjustmentLine(this)\">X</button>\n    </div>");
    $('.select2').select2();
}
function removeAdjustmentLine(elem) {
    //console.log("removing adjustment line");//DEV
    var p = $(elem).parent()[0];
    p.remove();
}
function applyAdjustments() {
    g_chart.data.datasets[0].data = __spreadArrays(g_originalBudgetValues);
    var chartData = g_chart.data.datasets[0].data; //note this is a reference!
    var depts = g_chart.data.labels;
    $.each($(".adjustment"), function (idx, val) {
        var policeIndex = g_chart.data.labels.indexOf(g_policeLabel);
        var percent = $(val).children(".adjustmentAmount").val() / 100;
        var amnt = percent * g_originalBudgetValues[policeIndex];
        var toDepartment = $(val).children(".receivingDepartment").val();
        var toDepartmentIndex = g_chart.data.labels.indexOf(toDepartment);
        chartData[policeIndex] -= amnt;
        chartData[toDepartmentIndex] += amnt;
        g_chart.update();
    });
}
function discloseExcludes(excludes) {
    var excludesList = $("#excludes").children("ul");
    if (excludes.length > 0) {
        $.each(excludes, function (idx, val) {
            excludesList.append("<li>" + val + "</li>");
        });
        $("#excludes").show();
    }
    else {
        excludesList.html("");
        $("#excludes").hide();
    }
}
function showLinkToBudget(link) {
    $("#budgetLink").show().attr("href", link);
}
