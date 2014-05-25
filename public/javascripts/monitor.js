$(document).ready(function () {
    $("#toggleMonitor").click(function () {
//        alert("Blah");
        $("#monitorForm").toggle("slow", function () {
            // Animation complete.
        });
    });

    $(".delete").click(function () {
//        var confirm = confirm("Delete");
        if (confirm("Are you sure you want to delete that monitor?")) {
            var dataID = $(this).attr("data-id");
            $.ajax({
                url: "api/delete/" + dataID,
                context: $(this).closest("div"),
                type: "DELETE"
            }).done(function () {
                $(this).fadeOut("slow");
            });
        }
    });

    $(".toggleActive").click(function () {
        $.ajax({
            url: "api/toggle/" + $(this).attr("data-id"),
            context: $(this).closest("a"),
            type: "POST"
        }).success(function () {
            $(this).text(function (_, oldText) {
                return oldText === 'Active' ? 'Disabled' : 'Active';
            });
        });
    });
});

