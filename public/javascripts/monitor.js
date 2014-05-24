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
                url: "api/" + dataID,
                context: $(this).closest("div"),
                type: "DELETE"
            }).done(function () {
                $(this).fadeOut("slow");  
            });
        }
    });
});

