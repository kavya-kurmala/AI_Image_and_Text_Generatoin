let enhancedPrompt = "";

async function enhance() {
  const text = document.getElementById("textInput").value;

  const res = await fetch("http://localhost:5000/enhance", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ text })
  });

  const data = await res.json();

  console.log("Enhance Response:", data);

  enhancedPrompt = data.enhanced || "Error enhancing text";

  document.getElementById("enhancedText").innerText = enhancedPrompt;
}



async function generate() {
  if (!enhancedPrompt) {
    alert("Please enhance prompt first");
    return;
  }

  const res = await fetch("http://localhost:5000/generate", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ prompt: enhancedPrompt })
  });

  const data = await res.json();

  console.log("Image Response:", data);

  if (data.image) {
    document.getElementById("imageOutput").src = data.image;
  } else {
    alert("Image generation failed");
  }
}



async function analyze() {
  const file = document.getElementById("imageInput").files[0];

  if (!file) {
    alert("Please upload an image");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("http://localhost:5000/analyze", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  console.log("Analysis Response:", data);

  document.getElementById("analysis").innerText =
    data.analysis || "Analysis failed";
}
