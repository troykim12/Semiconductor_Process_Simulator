# Semiconductor Process Simulator

## Silicon Photonics 3D Knowledge Graph

This project now includes a standalone interactive 3D knowledge graph focused on silicon photonics concepts.

### What it shows
- Core devices (waveguides, resonators, modulators, couplers, detectors)
- Materials/platforms (SOI, silicon nitride, III-V integration)
- Fabrication steps (lithography, etching, CMOS foundry flow)
- System-level applications (WDM transceivers, co-packaged optics, LiDAR PICs)

### Run it locally
Because this app uses JavaScript modules, serve it with a local web server:

```bash
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000`

### Interaction
- Drag to orbit
- Scroll to zoom
- Click any node to show concept details and connected topics
