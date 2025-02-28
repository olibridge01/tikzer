from abc import ABC, abstractmethod
from typing import List, Optional, Tuple

class Element(ABC):
    @abstractmethod
    def get_properties(self) -> dict:
        pass

class Node(Element):
    def __init__(self, x: float, y: float, label: str = "", id: str = None, radius: float = 5.0):
        self.x = x
        self.y = y
        self.label = label
        self.id = id or f"N{hash(str(x) + str(y))}"
        self.radius = radius
        self.style = {
            "shape": "circle",
            "minimum_size": self.radius / 50,
            "fill": "lightgray",
            "opacity": 1.0,
            "draw": "black",
            "line_width": 0.05,
            "label_position": "above",
            "label_distance": 0.1,
            "font": "\\normalsize"
        }
        self.rotate = 0.0
        self.anchor = "center"
        self.inner_sep = 0.1
        self.math_mode = False  # Default to non-math mode

    def get_properties(self) -> dict:
        return {
            "x": self.x,
            "y": self.y,
            "label": self.label,
            "id": self.id,
            "radius": self.radius,
            "style": self.style,
            "rotate": self.rotate,
            "anchor": self.anchor,
            "inner_sep": self.inner_sep,
            "math_mode": self.math_mode
        }

class Edge(Element):
    def __init__(self, start: Node, end: Node, directed: bool = False):
        self.start = start
        self.end = end
        self.directed = directed
        self.style = {
            "color": "black",
            "line_width": 0.05,  # cm
            "opacity": 1.0,
            "label": "",
            "label_position": "above",
            "label_distance": 0.1,  # cm
            "dash_pattern": "solid"
        }
        self.bend = None  # e.g., "left", "right", or 30 (degrees)
        self.shorten_start = 0.0  # cm
        self.shorten_end = 0.0  # cm
        self.arrow_type = "default"  # e.g., "stealth", "latex"
        self.control_points: List[Tuple[float, float]] = []  # For Bezier curves

    def get_properties(self) -> dict:
        return {
            "start": self.start, 
            "end": self.end, 
            "directed": self.directed,
            "style": self.style, 
            "bend": self.bend, 
            "shorten_start": self.shorten_start,
            "shorten_end": self.shorten_end, 
            "arrow_type": self.arrow_type,
            "control_points": self.control_points
        }

class Diagram:
    def __init__(self):
        self.elements: List[Element] = []
    
    def add_element(self, element: Element):
        self.elements.append(element)
    
    def add_node(self, x: float, y: float, label: str = "", id: str = None, radius: float = 5.0) -> Node:
        node = Node(x, y, label, id, radius)
        self.elements.append(node)
        return node
    
    def add_edge(self, start: Node, end: Node, directed: bool = False) -> Edge:
        edge = Edge(start, end, directed)
        self.elements.append(edge)
        return edge