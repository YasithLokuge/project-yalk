import React from 'react'
import HomeIcon from '@mui/icons-material/Home';
import FormatListNumberedRtlIcon from '@mui/icons-material/FormatListNumberedRtl';
import NoteIcon from '@mui/icons-material/Note';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PollIcon from '@mui/icons-material/Poll';
import PieChartIcon from '@mui/icons-material/PieChart';

export const SidebarData = [
    {

        title: "Home" ,
        icon: <HomeIcon />,
        link: "/home"

    },
    {

        title: "Categories" ,
        icon: <FormatListNumberedRtlIcon />,
        link: "/categories"

    },
    {

        title: "Records" ,
        icon: <NoteIcon />,
        link: "/records"

    },
    {

        title: "Monthly Income" ,
        icon: <PollIcon />,
        link: "/charts"

    },
    {

        title: "Trend" ,
        icon: <TrendingUpIcon />,
        link: "/trend"

    },
    {

        title: "Breakdown" ,
        icon: <PieChartIcon />,
        link: "/breakdown"

    }
]