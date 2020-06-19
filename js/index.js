$(document).ready(function () {
    $('.select2').select2();
    $('#budgetSelectForm').submit(function (evt) {
        evt.preventDefault();
        var form = evt.currentTarget;
        var fd = new FormData(form);
        $.getJSON("data/" + fd.get("state") + "/" + fd.get("city") + "/" + fd.get("year") + ".json", function (data) {
            console.dir(data);
            createGraph(data.budget);
        });
    });
    function createGraph(budget) {
        var ctx = $("#graph")[0].getContext('2d');
        var chart = new Chart(ctx, {
            type: "pie",
            data: {
                labels: budget.keys(),
                datasets: [{
                        data: budget.values(),
                        borderWidth: 1
                    }]
            }
        });
    }
});
