// MRI知识图谱数据
const mriKnowledgeData = {
    nodes: [
        { id: "mri", name: "磁共振成像", type: "technique" },
        { id: "t1", name: "T1加权", type: "sequence" },
        { id: "t2", name: "T2加权", type: "sequence" },
        { id: "flair", name: "FLAIR", type: "sequence" },
        { id: "dwi", name: "扩散加权", type: "sequence" },
        { id: "brain", name: "脑部", type: "anatomy" },
        { id: "spine", name: "脊柱", type: "anatomy" },
        { id: "abdomen", name: "腹部", type: "anatomy" },
        { id: "tumor", name: "肿瘤检测", type: "application" },
        { id: "stroke", name: "脑卒中", type: "application" },
        { id: "ms", name: "多发性硬化", type: "application" }
    ],
    links: [
        { source: "mri", target: "t1" },
        { source: "mri", target: "t2" },
        { source: "mri", target: "flair" },
        { source: "mri", target: "dwi" },
        { source: "t1", target: "brain" },
        { source: "t1", target: "spine" },
        { source: "t2", target: "brain" },
        { source: "t2", target: "abdomen" },
        { source: "flair", target: "brain" },
        { source: "dwi", target: "brain" },
        { source: "brain", target: "tumor" },
        { source: "brain", target: "stroke" },
        { source: "brain", target: "ms" },
        { source: "dwi", target: "stroke" },
        { source: "flair", target: "ms" }
    ]
};

// 创建知识图谱可视化
function createKnowledgeGraph() {
    const width = document.getElementById('knowledge-graph').clientWidth;
    const height = document.getElementById('knowledge-graph').clientHeight;

    // 清除现有内容
    d3.select("#knowledge-graph").html("");

    const svg = d3.select("#knowledge-graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const simulation = d3.forceSimulation(mriKnowledgeData.nodes)
        .force("link", d3.forceLink(mriKnowledgeData.links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // 颜色映射
    const colorScale = d3.scaleOrdinal()
        .domain(["technique", "sequence", "anatomy", "application"])
        .range(["#e74c3c", "#3498db", "#2ecc71", "#f39c12"]);

    const link = svg.append("g")
        .selectAll("line")
        .data(mriKnowledgeData.links)
        .enter().append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 2);

    const node = svg.append("g")
        .selectAll("circle")
        .data(mriKnowledgeData.nodes)
        .enter().append("circle")
        .attr("r", 8)
        .attr("fill", d => colorScale(d.type))
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    const label = svg.append("g")
        .selectAll("text")
        .data(mriKnowledgeData.nodes)
        .enter().append("text")
        .text(d => d.name)
        .attr("font-size", 12)
        .attr("dx", 12)
        .attr("dy", 4);

    node.append("title")
        .text(d => d.name);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

// 过滤函数
function filterByType(type) {
    if (type === 'all') {
        d3.selectAll("circle").style("opacity", 1);
        d3.selectAll("line").style("opacity", 1);
        d3.selectAll("text").style("opacity", 1);
    } else {
        d3.selectAll("circle").style("opacity", d => d.type === type ? 1 : 0.1);
        d3.selectAll("line").style("opacity", 0.1);
        d3.selectAll("text").style("opacity", d => d.type === type ? 1 : 0.1);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待页面完全加载后再创建图谱
    setTimeout(createKnowledgeGraph, 100);
    
    // 平滑滚动
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

// 窗口大小改变时重新绘制
window.addEventListener('resize', function() {
    createKnowledgeGraph();
});