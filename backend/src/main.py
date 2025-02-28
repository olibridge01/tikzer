from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tikzer.backend.src.core.module import Diagram, Node
from tikzer.backend.src.exporters import StandardTikzExporter
import subprocess
import os
import base64

app = FastAPI()
exporter = StandardTikzExporter()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate_tikz")
async def generate_tikz(data: dict):
    diagram = Diagram()
    node_map = {}
    for node_data in data.get("nodes", []):
        node = diagram.add_node(
            x=node_data["x"],
            y=node_data["y"],
            label=node_data.get("label", ""),
            id=node_data.get("id"),
            radius=node_data.get("radius", 5.0)  # New
        )
        node_map[node.id] = node
    for edge_data in data.get("edges", []):
        start = node_map[edge_data["startId"]]
        end = node_map[edge_data["endId"]]
        edge = diagram.add_edge(start, end, edge_data.get("directed", False))
        if "style" in edge_data:
            edge.style.update(edge_data["style"])
    tikz_code = exporter.export(diagram)
    return {"tikz": tikz_code}

@app.post("/render_tikz")
async def render_tikz(data: dict):
    tikz_code = data.get("tikz", "")
    if not tikz_code:
        return {"svg": ""}

    # Wrap in standalone document
    tex_content = f"""
    \\documentclass{{standalone}}
    \\usepackage{{tikz}}
    \\begin{{document}}
    {tikz_code}
    \\end{{document}}
    """
    
    # Write to temp file
    with open("temp.tex", "w") as f:
        f.write(tex_content)
    
    try:
        # Compile to PDF
        subprocess.run(["pdflatex", "-interaction=nonstopmode", "temp.tex"], check=True)
        # Convert to SVG
        subprocess.run(["pdf2svg", "temp.pdf", "temp.svg"], check=True)
        # Read SVG
        with open("temp.svg", "rb") as f:
            svg_data = f.read()
        svg_base64 = base64.b64encode(svg_data).decode('utf-8')
    except subprocess.CalledProcessError as e:
        print(f"Rendering error: {e}")
        return {"svg": ""}
    finally:
        # Cleanup
        for file in ["temp.tex", "temp.pdf", "temp.svg", "temp.aux", "temp.log"]:
            if os.path.exists(file):
                os.remove(file)
    
    return {"svg": f"data:image/svg+xml;base64,{svg_base64}"}

@app.post("/render_label")
async def render_label(data: dict):
    label = data.get("label", "")
    # Check if label contains $$ to determine if math mode is needed
    is_math_mode = "$$" in label
    
    # If it's math mode, strip the $$ markers from the content
    if is_math_mode:
        label = label.replace("$$", "")
        content = f"$${label}$$"
    else:
        content = label
        
    tex_content = f"""
    \\documentclass{{standalone}}
    \\usepackage{{tikz}}
    \\begin{{document}}
    {content}
    \\end{{document}}
    """
    with open("temp_label.tex", "w") as f:
        f.write(tex_content)
    try:
        subprocess.run(["pdflatex", "-interaction=nonstopmode", "temp_label.tex"], check=True)
        subprocess.run(["pdf2svg", "temp_label.pdf", "temp_label.svg"], check=True)
        with open("temp_label.svg", "rb") as f:
            svg_data = f.read()
        svg_base64 = base64.b64encode(svg_data).decode('utf-8')
        return {"svg": f"data:image/svg+xml;base64,{svg_base64}"}
    except subprocess.CalledProcessError as e:
        print(f"Label render error: {e}")
        return {"svg": ""}
    finally:
        for file in ["temp_label.tex", "temp_label.pdf", "temp_label.svg", "temp_label.aux", "temp_label.log"]:
            if os.path.exists(file):
                os.remove(file)