// Types for our compiler
type BlockType = 'event' | 'motion' | 'looks' | 'sound' | 'control' | 'sensing' | 'operators' | 'variables' | 'custom';

interface BlockNode {
    type: BlockType;
    name: string;
    args: (string | number | BlockNode)[];
    next?: BlockNode;
}

interface Script {
    blocks: BlockNode[];
}

interface Program {
    scripts: Script[];
    variables: Map<string, any>;
    lists: Map<string, any[]>;
}

export type {
    BlockType,
    BlockNode,
    Script,
    Program
}