from abc import ABC, abstractmethod
from typing import List, Dict, Tuple

from tikzer.backend.src.core import Diagram, Node, Edge

class TikzExporter(ABC):
    @abstractmethod
    def export(self, diagram: Diagram) -> str:
        pass

class StandardTikzExporter(TikzExporter):
    def export(self, diagram: Diagram) -> str:
        tikz = "\\begin{tikzpicture}\n"
        for elem in diagram.elements:
            if isinstance(elem, Node):
                props = elem.get_properties()
                style = props["style"]
                label = props["label"]
                
                # If label already contains $ or $$, don't modify it as it's already in math mode
                # TikZ will handle the math mode correctly
                
                options = [
                    style["shape"],
                    f"fill={style['fill']}",
                    f"draw={style['draw']}",
                    f"line width={style['line_width']}cm",
                    f"minimum size={props['radius']/50:.2f}cm",
                    f"fill opacity={style['opacity']}",
                    f"inner sep={props['inner_sep']}cm",
                    f"anchor={props['anchor']}"
                ]
                if props["rotate"]:
                    options.append(f"rotate={props['rotate']}")
                if style["label_position"] and label:
                    options.append(f"{style['label_position']}={style['label_distance']}cm")
                tikz += (f"  \\node[{', '.join(options)}] at ({props['x']/100:.2f}, {props['y']/100:.2f}) "
                        f"({props['id']}) {{{label}}};\n")
            elif isinstance(elem, Edge):
                props = elem.get_properties()
                style = props["style"]
                arrow = "->" if props["directed"] else "-"
                options = [
                    arrow,
                    style["color"],
                    f"line width={style['line_width']}cm",
                    f"opacity={style['opacity']}",
                    style["dash_pattern"]
                ]
                if props["arrow_type"] != "default":
                    options[0] = f"-{props['arrow_type']}"
                if props["shorten_start"]:
                    options.append(f"shorten >={props['shorten_start']}cm")
                if props["shorten_end"]:
                    options.append(f"shorten <={props['shorten_end']}cm")
                path = f"({props['start'].id})"
                if props["control_points"]:
                    controls = " and ".join(f"({x/100:.2f}, {y/100:.2f})" for x, y in props["control_points"])
                    path += f" .. controls {controls} .."
                elif props["bend"]:
                    path += f" to[bend {props['bend']}]"
                else:
                    path += " to"
                path += f" ({props['end'].id})"
                if style["label"]:
                    label_node = f"node[{style['label_position']}={style['label_distance']}cm] {{{style['label']}}}"
                else:
                    label_node = ""
                tikz += f"  \\draw[{', '.join(options)}] {path} {label_node};\n"
        tikz += "\\end{tikzpicture}"
        return tikz